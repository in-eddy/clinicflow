import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';

const empty = { fullName: '', cin: '', phone: '', birthDate: '', address: '' };

export default function Patients() {
  const { user } = useAuth();
  const [res, setRes] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() =>
    api.get('/patients', { params: { search: query || undefined, page, limit: 10 } })
      .then((r) => setRes(r.data)), [query, page]);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault(); setError('');
    const { id, createdAt, ...body } = form;
    if (!body.address) delete body.address;
    try {
      if (id) await api.put(`/patients/${id}`, body); else await api.post('/patients', body);
      setForm(null); load();
    } catch (err) { setError(errMsg(err)); }
  };
  const remove = async (id) => {
    if (confirm('Delete this patient and their appointments?')) { await api.delete(`/patients/${id}`); load(); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h2>Patients</h2>
      <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search); }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or CIN" />
        <button>Search</button>
        <button type="button" onClick={() => { setForm(empty); setError(''); }}>+ Add patient</button>
      </form>

      {form && (
        <form onSubmit={save} style={{ display: 'grid', gap: 6, maxWidth: 320, margin: '12px 0' }}>
          <input placeholder="Full name" value={form.fullName} onChange={set('fullName')} />
          <input placeholder="CIN" value={form.cin} onChange={set('cin')} />
          <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
          <input type="date" value={form.birthDate} onChange={set('birthDate')} />
          <input placeholder="Address (optional)" value={form.address ?? ''} onChange={set('address')} />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div><button>Save</button> <button type="button" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}

      <table border="1" cellPadding="6" style={{ marginTop: 12 }}>
        <thead><tr><th>Name</th><th>CIN</th><th>Phone</th><th>Birth date</th><th></th></tr></thead>
        <tbody>
          {res.data.map((p) => (
            <tr key={p.id}>
              <td><Link to={`/patients/${p.id}`}>{p.fullName}</Link></td>
              <td>{p.cin}</td><td>{p.phone}</td><td>{p.birthDate}</td>
              <td>
                <button onClick={() => { setForm(p); setError(''); }}>Edit</button>
                {user.role === 'admin' && <button onClick={() => remove(p.id)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 8 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        {' '}Page {res.pagination.page} / {res.pagination.totalPages || 1}{' '}
        <button disabled={page >= res.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
