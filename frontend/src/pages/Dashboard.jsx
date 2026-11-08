import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/dashboard/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <p>Loading...</p>;
  const cards = [['Total patients', s.totalPatients], ['Today', s.todayAppointments],
                 ['Pending', s.pending], ['Confirmed', s.confirmed]];
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {cards.map(([label, n]) => (
        <div key={label} style={{ border: '1px solid #ccc', padding: 24, minWidth: 140 }}>
          <div>{label}</div><strong style={{ fontSize: 32 }}>{n}</strong>
        </div>
      ))}
    </div>
  );
}