import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, errDetail } from '../api';
import { useAuth } from '../AuthContext';

const empty = { fullName: '', email: '', password: '', role: 'staff' };

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(() => api.get('/users').then((r) => setUsers(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      await api.post('/users', form);
      setSuccess(`Account created for ${form.email}`);
      setForm(empty);
      load();
    } catch (err) { setError(errDetail(err)); }
  };

  const remove = async (u) => {
    if (!confirm(`Delete the account of ${u.fullName} (${u.email})?`)) return;
    try { await api.delete(`/users/${u.id}`); load(); }
    catch (err) { alert(errMsg(err)); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={create} style={{ display: 'grid', gap: 6, maxWidth: 360 }}>
        <input placeholder="Full name" value={form.fullName} onChange={set('fullName')} />
        <input placeholder="Email" value={form.email} onChange={set('email')} />
        <input type="password" placeholder="Password (8+ characters, a letter and a digit)" value={form.password} onChange={set('password')} />
        <select value={form.role} onChange={set('role')}>
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
        {error && <p className="error">{error}</p>}
        {success && <p style={{ margin: 0, color: 'var(--confirmed-fg)', fontWeight: 600 }}>{success}</p>}
        <button>Create account</button>
      </form>

      <table style={{ marginTop: 20 }}>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}{u.id === me.id && ' (you)'}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>{u.id !== me.id && <button className="danger" onClick={() => remove(u)}>Delete</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
