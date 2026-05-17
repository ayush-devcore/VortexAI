// ─────────────────────────────────────────────────────────
// Rate Limiter — Protect API Routes
// ─────────────────────────────────────────────────────────

const rateLimit = require('express-rate-limit');

/** General API rate limiter — 100 req/15min */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Try again in 15 minutes.' },
});

/** Gemini/AI routes — stricter: 20 req/15min */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'AI rate limit exceeded. Try again shortly.' },
});

/** Auth routes — 10 attempts/15min */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth attempts. Try again in 15 minutes.' },
});

module.exports = { apiLimiter, aiLimiter, authLimiter };
