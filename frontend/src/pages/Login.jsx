import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await login(email, password); nav('/'); }
    catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="login">
      <div className="login-brand">
        <h1>ClinicFlow</h1>
        <p>Manage patients and appointments for your clinic.</p>
      </div>
      <form className="login-form" onSubmit={submit}>
        <h2>Sign in</h2>
        <label>Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button>Sign in</button>
      </form>
    </div>
  );
}
