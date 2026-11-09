const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const AppError = require('../utils/AppError');

// On ne sélectionne JAMAIS password_hash dans les réponses de l'API.
const COLS = `id, full_name AS "fullName", email, role, created_at AS "createdAt"`;

exports.create = async ({ fullName, email, password, role }) => {
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING ${COLS}`,
      [fullName, email, hash, role]);
    return rows[0];
  } catch (e) {
    if (e.code === '23505') throw new AppError(409, 'This email is already used');
    throw e;
  }
};

exports.list = async () =>
  (await pool.query(`SELECT ${COLS} FROM users ORDER BY created_at DESC`)).rows;

exports.remove = async (id, currentUserId) => {
  // Un admin ne peut pas supprimer son propre compte (sinon risque de plus aucun admin).
  if (id === currentUserId) throw new AppError(400, 'You cannot delete your own account');
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (!rowCount) throw new AppError(404, 'User not found');
  } catch (e) {
    // 23503 = clé étrangère : appointments.created_by est en ON DELETE RESTRICT
    if (e.code === '23503') throw new AppError(409, 'This user created appointments and cannot be deleted');
    throw e;
  }
};
