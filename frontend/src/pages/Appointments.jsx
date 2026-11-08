import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';

const STATUSES = ['pending', 'confirmed', 'cancelled'];

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '' });
  const [form, setForm] = useState({ patientId: '', appointmentDate: '', reason: '', notes: '' });
  const [error, setError] = useState('');

  const load = useCallback(() =>
    api.get('/appointments', { params: { date: filters.date || undefined, status: filters.status || undefined } })
      .then((r) => setItems(r.data)), [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/patients', { params: { limit: 100 } }).then((r) => setPatients(r.data.data)); }, []);

  const create = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/appointments', {
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        notes: form.notes || undefined,
      });
      setForm({ patientId: '', appointmentDate: '', reason: '', notes: '' });
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const changeStatus = async (id, status) => {
    try { await api.patch(`/appointments/${id}/status`, { status }); load(); }
    catch (err) { alert(errMsg(err)); }
  };
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h2>Appointments</h2>
      <form onSubmit={create} style={{ display: 'grid', gap: 6, maxWidth: 360 }}>
        <select value={form.patientId} onChange={f('patientId')}>
          <option value="">-- Patient --</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.cin})</option>)}
        </select>
        <input type="datetime-local" value={form.appointmentDate} onChange={f('appointmentDate')} />
        <input placeholder="Reason" value={form.reason} onChange={f('reason')} />
        <input placeholder="Notes (optional)" value={form.notes} onChange={f('notes')} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button>Create (pending)</button>
      </form>

      <div style={{ margin: '16px 0' }}>
        Filters: <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <table border="1" cellPadding="6">
        <thead><tr><th>Date</th><th>Patient</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.appointmentDate).toLocaleString()}</td>
              <td>{a.patientName}</td><td>{a.reason}</td>
              <td>
                <select value={a.status} onChange={(e) => changeStatus(a.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}