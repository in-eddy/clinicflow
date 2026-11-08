const pool = require('../config/db');
const AppError = require('../utils/AppError');

const SELECT = `SELECT a.id, a.patient_id AS "patientId", p.full_name AS "patientName",
  a.appointment_date AS "appointmentDate", a.status, a.reason, a.notes,
  a.created_by AS "createdBy", a.created_at AS "createdAt"
  FROM appointments a JOIN patients p ON p.id = a.patient_id`;

async function assertNoConflict(client, patientId, date, excludeId = null) {
  const { rowCount } = await client.query(
    `SELECT 1 FROM appointments
     WHERE patient_id = $1 AND status = 'confirmed'
       AND appointment_date > $2::timestamptz - interval '30 minutes'
       AND appointment_date < $2::timestamptz + interval '30 minutes'
       AND ($3::uuid IS NULL OR id <> $3)
     LIMIT 1`, [patientId, date, excludeId]);
  if (rowCount) throw new AppError(409, 'Patient already has a confirmed appointment within 30 minutes');
}

async function inTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

async function lockPatient(client, patientId) {
  const { rowCount } = await client.query('SELECT 1 FROM patients WHERE id = $1 FOR UPDATE', [patientId]);
  if (!rowCount) throw new AppError(404, 'Patient not found');
}

exports.create = (d, userId) => inTransaction(async (client) => {
  await lockPatient(client, d.patientId);
  if (d.status === 'confirmed') await assertNoConflict(client, d.patientId, d.appointmentDate);
  const ins = await client.query(
    `INSERT INTO appointments (patient_id, appointment_date, status, reason, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [d.patientId, d.appointmentDate, d.status, d.reason, d.notes ?? null, userId]);
  return (await client.query(`${SELECT} WHERE a.id = $1`, [ins.rows[0].id])).rows[0];
});

exports.list = async ({ date, status, patientId }) => {
  const conds = [], params = [];
  if (date) {
    params.push(date);
    conds.push(`a.appointment_date >= $${params.length}::date AND a.appointment_date < $${params.length}::date + 1`);
  }
  if (status) { params.push(status); conds.push(`a.status = $${params.length}`); }
  if (patientId) { params.push(patientId); conds.push(`a.patient_id = $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  return (await pool.query(`${SELECT} ${where} ORDER BY a.appointment_date ASC`, params)).rows;
};

exports.updateStatus = (id, status) => inTransaction(async (client) => {
  const cur = await client.query('SELECT patient_id, appointment_date FROM appointments WHERE id = $1', [id]);
  if (!cur.rows[0]) throw new AppError(404, 'Appointment not found');
  const { patient_id, appointment_date } = cur.rows[0];

  await lockPatient(client, patient_id);
  if (status === 'confirmed') await assertNoConflict(client, patient_id, appointment_date, id);

  await client.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
  return (await client.query(`${SELECT} WHERE a.id = $1`, [id])).rows[0];
});