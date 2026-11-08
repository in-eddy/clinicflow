const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../utils/AppError');

exports.login = async ({ email, password }) => {
  const { rows } = await pool.query(
    'SELECT id, full_name AS "fullName", email, role, password_hash FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new AppError(401, 'Invalid email or password');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  delete user.password_hash;
  return { token, user };
};

exports.me = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, full_name AS "fullName", email, role FROM users WHERE id = $1', [id]);
  if (!rows[0]) throw new AppError(404, 'User not found');
  return rows[0];
};