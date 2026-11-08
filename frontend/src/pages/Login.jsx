import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await login(email, password); nav('/'); }
    catch (err) { setError(errMsg(err)); }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: '80px auto', display: 'grid', gap: 8 }}>
      <h2>ClinicFlow</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button>Login</button>
    </form>
  );
}