const pool = require('../config/db');

exports.stats = async () => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM patients)::int AS "totalPatients",
      (SELECT COUNT(*) FROM appointments
        WHERE appointment_date >= CURRENT_DATE AND appointment_date < CURRENT_DATE + 1)::int AS "todayAppointments",
      (SELECT COUNT(*) FROM appointments WHERE status = 'pending')::int AS "pending",
      (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed')::int AS "confirmed"`);
  return rows[0];
};