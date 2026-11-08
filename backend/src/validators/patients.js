const { z } = require('zod');

exports.patientSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  cin: z.string().trim().min(4).max(20).transform((s) => s.toUpperCase()),
  phone: z.string().trim().regex(/^[0-9+\s-]{8,20}$/, 'Invalid phone'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  address: z.string().trim().max(255).optional(),
});

exports.listQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});