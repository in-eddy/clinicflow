const { z } = require('zod');

// Accepte "YYYY-MM-DD" (format de l'API et de <input type="date">)
// et "DD/MM/YYYY" (format habituel au Maroc). Retourne toujours "YYYY-MM-DD".
function parseBirthDate(raw, ctx) {
  const s = raw.trim();
  let y, m, d;

  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (match) {
    [, y, m, d] = match;
  } else if ((match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s))) {
    [, d, m, y] = match;
  } else {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Use YYYY-MM-DD or DD/MM/YYYY' });
    return z.NEVER;
  }

  const year = Number(y), month = Number(m), day = Number(d);
  if (year < 1900) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Birth date must be after 1900' });
    return z.NEVER;
  }

  // JavaScript "corrige" les dates impossibles (31 février devient 3 mars).
  // On reconstruit la date et on vérifie qu'on retombe sur les mêmes valeurs.
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!exists) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'This date does not exist' });
    return z.NEVER;
  }
  if (date > new Date()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Birth date cannot be in the future' });
    return z.NEVER;
  }
  return `${y}-${m}-${d}`;
}

exports.patientSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  cin: z.string().trim().min(4).max(20).transform((s) => s.toUpperCase()),
  phone: z.string().trim().regex(/^[0-9+\s-]{8,20}$/, 'Invalid phone'),
  birthDate: z.string().transform(parseBirthDate),
  address: z.string().trim().max(255).optional(),
});

exports.listQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
