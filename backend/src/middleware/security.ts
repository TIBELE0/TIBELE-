import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Trop de tentatives d\'authentification. Veuillez reessayer plus tard.',
  },
});

export const exportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as { userId?: string; ip?: string }).userId ?? req.ip ?? 'anon',
  message: {
    message: 'Trop de requetes d\'export. Veuillez reessayer dans une minute.',
  },
});