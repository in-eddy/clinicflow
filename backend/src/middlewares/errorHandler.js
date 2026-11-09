const { ZodError } = require('zod');

module.exports = (err, req, res, next) => {
  if (err instanceof ZodError)
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.code === '23505') return res.status(409).json({ message: 'Value already exists (unique)' });
  if (err.code === '22007' || err.code === '22008') return res.status(400).json({ message: 'Invalid date' });
  if (err.code === '22P02') return res.status(400).json({ message: 'Invalid identifier format' });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};