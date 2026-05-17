// ─────────────────────────────────────────────────────────
// Auth Middleware — JWT access tokens + secure cookies
// ─────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const BCRYPT_ROUNDS = 12;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('vortex_access', accessToken, {
    ...COOKIE_OPTS,
    signed: true,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('vortex_refresh', refreshToken, {
    ...COOKIE_OPTS,
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  res.clearCookie('vortex_access', { path: '/' });
  res.clearCookie('vortex_refresh', { path: '/' });
  res.clearCookie('vortex_token', { path: '/' });
}

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function extractAccessToken(req) {
  return (
    req.signedCookies?.vortex_access ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    null
  );
}

function extractRefreshToken(req) {
  return req.signedCookies?.vortex_refresh || req.body?.refreshToken || null;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    logger.warn(`Auth failed: ${error.message}`);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const token = extractAccessToken(req);
    if (token) req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    /* continue without user */
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = {
  generateToken,
  setAuthCookies,
  clearAuthCookies,
  hashPassword,
  comparePassword,
  extractAccessToken,
  extractRefreshToken,
  requireAuth,
  optionalAuth,
  requireRole,
};
