export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function ageFrom(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  const month = now.getMonth() + 1;
  let age = now.getFullYear() - y;
  if (month < m || (month === m && now.getDate() < d)) age -= 1;
  return age;
}

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
