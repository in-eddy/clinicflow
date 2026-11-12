import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';
import Users from './pages/Users';

function Protected({ children, adminOnly = false }) {
  const { user, loading, logout } = useAuth();
  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">ClinicFlow</div>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/patients">Patients</NavLink>
        <NavLink to="/appointments">Appointments</NavLink>
        {user.role === 'admin' && <NavLink to="/users">Users</NavLink>}
        <div className="who">
          <strong>{user.fullName}</strong>
          {user.role}
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="page">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/patients" element={<Protected><Patients /></Protected>} />
      <Route path="/patients/:id" element={<Protected><PatientDetails /></Protected>} />
      <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
      <Route path="/users" element={<Protected adminOnly><Users /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
