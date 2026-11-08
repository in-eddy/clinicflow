import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);

  useEffect(() => {
    const date = new Date().toISOString().slice(0, 10);
    api.get('/dashboard/stats').then((r) => setStats(r.data));
    api.get('/appointments', { params: { date } }).then((r) => setToday(r.data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const items = [
    ['Total patients', stats.totalPatients, ''],
    ['Appointments today', stats.todayAppointments, ''],
    ['Pending', stats.pending, 'pending'],
    ['Confirmed', stats.confirmed, 'confirmed'],
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stats">
        {items.map(([label, n, tone]) => (
          <div key={label} className={`stat ${tone}`}>
            <div className="n">{n}</div>
            <div className="l">{label}</div>
          </div>
        ))}
      </div>

      <h3>Today's appointments</h3>
      {today.length === 0 ? (
        <div className="agenda"><p className="empty">No appointments today. Create one from the Appointments page.</p></div>
      ) : (
        <ul className="agenda">
          {today.map((a) => (
            <li key={a.id}>
              <span className="time">
                {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div>
                <div>{a.patientName}</div>
                <div className="reason">{a.reason}</div>
              </div>
              <span className="pill" data-status={a.status}>{a.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
