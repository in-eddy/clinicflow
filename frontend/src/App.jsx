import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #ccc' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/patients">Patients</Link>
        <Link to="/appointments">Appointments</Link>
        <span style={{ marginLeft: 'auto' }}>{user.fullName} ({user.role})</span>
        <LogoutButton />
      </nav>
      <main style={{ padding: 16 }}>{children}</main>
    </>
  );
}
function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/patients" element={<Protected><Patients /></Protected>} />
      <Route path="/patients/:id" element={<Protected><PatientDetails /></Protected>} />
      <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}