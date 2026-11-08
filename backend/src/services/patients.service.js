const pool = require('../config/db');
const AppError = require('../utils/AppError');

const COLS = `id, full_name AS "fullName", cin, phone,
  to_char(birth_date, 'YYYY-MM-DD') AS "birthDate", address, created_at AS "createdAt"`;

exports.create = async (d) => {
  const { rows } = await pool.query(
    `INSERT INTO patients (full_name, cin, phone, birth_date, address)
     VALUES ($1,$2,$3,$4,$5) RETURNING ${COLS}`,
    [d.fullName, d.cin, d.phone, d.birthDate, d.address ?? null]);
  return rows[0];
};

exports.list = async ({ search, page, limit }) => {
  const params = [];
  let where = '';
  if (search) { params.push(`%${search}%`); where = 'WHERE full_name ILIKE $1 OR cin ILIKE $1'; }

  const total = (await pool.query(`SELECT COUNT(*)::int AS n FROM patients ${where}`, params)).rows[0].n;
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM patients ${where}
     ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, (page - 1) * limit]);

  return { data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

exports.getById = async (id) => {
  const { rows } = await pool.query(`SELECT ${COLS} FROM patients WHERE id = $1`, [id]);
  if (!rows[0]) throw new AppError(404, 'Patient not found');
  return rows[0];
};

exports.update = async (id, d) => {
  const { rows } = await pool.query(
    `UPDATE patients SET full_name=$1, cin=$2, phone=$3, birth_date=$4, address=$5
     WHERE id=$6 RETURNING ${COLS}`,
    [d.fullName, d.cin, d.phone, d.birthDate, d.address ?? null, id]);
  if (!rows[0]) throw new AppError(404, 'Patient not found');
  return rows[0];
};

exports.remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM patients WHERE id = $1', [id]);
  if (!rowCount) throw new AppError(404, 'Patient not found');
};