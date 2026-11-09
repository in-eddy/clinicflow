import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { formatDate, ageFrom } from '../utils/date';

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}`).then((r) => setPatient(r.data));
    api.get('/appointments', { params: { patientId: id } }).then((r) => setAppts(r.data));
  }, [id]);

  if (!patient) return <p>Loading...</p>;
  return (
    <div>
      <Link to="/patients">← Back</Link>
      <h2>{patient.fullName}</h2>
      <p>CIN: {patient.cin} | Phone: {patient.phone} | Born: {formatDate(patient.birthDate)} ({ageFrom(patient.birthDate)} years)</p>
      <p>Address: {patient.address || '—'}</p>
      <h3>Appointments</h3>
      <table border="1" cellPadding="6">
        <thead><tr><th>Date</th><th>Status</th><th>Reason</th><th>Notes</th></tr></thead>
        <tbody>
          {appts.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.appointmentDate).toLocaleString()}</td>
              <td><span className="pill" data-status={a.status}>{a.status}</span></td><td>{a.reason}</td><td>{a.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}