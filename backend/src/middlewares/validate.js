module.exports = (schema, source = 'body') => (req, res, next) => {
  req[source] = schema.parse(req[source]); // throws ZodError → error handler → 400
  next();
};