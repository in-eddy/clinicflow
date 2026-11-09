const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../utils/AppError');

exports.authenticate = async (req, res, next) => {
  try {
    const [type, token] = (req.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) throw new AppError(401, 'Missing token');

    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch { throw new AppError(401, 'Invalid or expired token'); }

    // Le token prouve QUI est connecté, mais le compte a pu être supprimé ou changer de rôle
    // depuis sa création. On relit donc l'utilisateur en base : suppression et changement de
    // rôle sont effectifs immédiatement, pas seulement à l'expiration du token (8h).
    const { rows } = await pool.query('SELECT id, role FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) throw new AppError(401, 'Account no longer exists');

    req.user = { id: rows[0].id, role: rows[0].role };
    next();
  } catch (err) { next(err); }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new AppError(403, 'Forbidden');
  next();
};
