const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.authenticate = (req, res, next) => {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) throw new AppError(401, 'Missing token');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new AppError(401, 'Invalid or expired token'); }
  next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new AppError(403, 'Forbidden');
  next();
};