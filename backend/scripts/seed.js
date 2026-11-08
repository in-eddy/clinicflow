require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const users = [
  ['Admin', 'admin@clinic.com', 'admin'],
  ['Staff One', 'staff1@clinic.com', 'staff'],
  ['Staff Two', 'staff2@clinic.com', 'staff'],
];
const patients = [
  ['Youssef El Amrani', 'AB123456', '0612345678', '1990-03-12', 'Casablanca'],
  ['Salma Benali', 'CD234567', '0623456789', '1985-07-25', 'Rabat'],
  ['Omar Idrissi', 'EF345678', '0634567890', '2001-11-02', null],
  ['Khadija Alaoui', 'GH456789', '0645678901', '1978-01-30', 'Khouribga'],
  ['Hamza Tazi', 'IJ567890', '0656789012', '1995-09-18', 'Marrakech'],
];
// [patientIndex, dayOffset, hour, status, reason]
const appts = [
  [0, 0, 9, 'confirmed', 'Consultation'], [0, 0, 14, 'pending', 'Follow-up'],
  [1, 0, 10, 'confirmed', 'Blood test'],  [1, 1, 11, 'pending', 'Check-up'],
  [2, 0, 11, 'pending', 'Headache'],      [2, 2, 15, 'confirmed', 'X-ray'],
  [3, -1, 9, 'cancelled', 'Consultation'],[3, 3, 10, 'confirmed', 'Vaccination'],
  [4, 0, 16, 'cancelled', 'Dental pain'], [4, 1, 9, 'confirmed', 'Check-up'],
];

(async () => {
  try {
    const hash = await bcrypt.hash('Password123!', 10);
    await pool.query('TRUNCATE appointments, patients, users CASCADE');

    const userIds = {};
    for (const [name, email, role] of users) {
      const r = await pool.query(
        'INSERT INTO users (full_name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id',
        [name, email, hash, role]);
      userIds[email] = r.rows[0].id;
    }
    const pids = [];
    for (const p of patients) {
      const r = await pool.query(
        'INSERT INTO patients (full_name,cin,phone,birth_date,address) VALUES ($1,$2,$3,$4,$5) RETURNING id', p);
      pids.push(r.rows[0].id);
    }
    for (const [pi, day, hour, status, reason] of appts) {
      await pool.query(
        `INSERT INTO appointments (patient_id, appointment_date, status, reason, created_by)
         VALUES ($1, date_trunc('day', now()) + make_interval(days => $2::int, hours => $3::int), $4, $5, $6)`,
        [pids[pi], day, hour, status, reason, userIds['staff1@clinic.com']]);
    }
    console.log('Seed done. All passwords: Password123!');
  } catch (e) { console.error(e); process.exitCode = 1; }
  finally { await pool.end(); }
})();