// ─────────────────────────────────────────────────────────
// Auth Middleware — JWT with HTTP-only Cookies
// ─────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Generate a signed JWT */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/** Set HTTP-only auth cookie */
function setAuthCookie(res, token) {
  res.cookie('vortex_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    signed: true,
  });
}

/** Hash a password */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/** Compare password with hash */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Auth middleware — verifies JWT from cookie or Authorization header.
 * In dev mode without DB, creates a mock user context.
 */
async function requireAuth(req, res, next) {
  try {
    // Extract token from signed cookie or Authorization header
    const token =
      req.signedCookies?.vortex_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // Dev fallback: mock user when no auth is configured
      if (process.env.NODE_ENV !== 'production') {
        const devUser = await prisma.user.findFirst();
        if (devUser) {
          req.user = { id: devUser.id, email: devUser.email, name: devUser.name, role: devUser.role };
          return next();
        }
      }
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    logger.warn(`Auth failed: ${error.message}`);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

/** Optional auth — attaches user if token exists, continues otherwise */
async function optionalAuth(req, res, next) {
  try {
    const token =
      req.signedCookies?.vortex_token ||
      req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      req.user = jwt.verify(token, JWT_SECRET);
    } else if (process.env.NODE_ENV !== 'production') {
      const devUser = await prisma.user.findFirst();
      if (devUser) req.user = { id: devUser.id, email: devUser.email, name: devUser.name, role: devUser.role };
    }
  } catch { /* silent — user stays undefined */ }
  next();
}

/** Role-based access control */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = {
  generateToken, setAuthCookie, hashPassword, comparePassword,
  requireAuth, optionalAuth, requireRole,
};
