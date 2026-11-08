const { z } = require('zod');
const status = z.enum(['pending', 'confirmed', 'cancelled']);

exports.createSchema = z.object({
  patientId: z.string().uuid(),
  appointmentDate: z.coerce.date(),
  status: status.default('pending'),
  reason: z.string().trim().min(3).max(255),
  notes: z.string().trim().max(1000).optional(),
});
exports.statusSchema = z.object({ status });
exports.listSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: status.optional(),
  patientId: z.string().uuid().optional(),
});