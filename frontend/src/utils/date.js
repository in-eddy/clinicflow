// On manipule les dates de naissance comme du TEXTE "YYYY-MM-DD".
// On évite new Date("1990-03-15") pour l'affichage : JavaScript le lit en UTC
// et le fuseau horaire peut décaler la date d'un jour.

// "1990-03-15" -> "15/03/1990"
export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// "1990-03-15" -> âge en années
export function ageFrom(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  const month = now.getMonth() + 1;
  let age = now.getFullYear() - y;
  if (month < m || (month === m && now.getDate() < d)) age -= 1;
  return age;
}

// "2026-11-09" (aujourd'hui, heure locale) : pour max d'un <input type="date">
export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// "2026-11-09T14:30" (maintenant, heure locale) : pour min d'un <input type="datetime-local">
export function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
