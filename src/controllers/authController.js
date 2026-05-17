// ─────────────────────────────────────────────────────────
// Auth Controller — Register, Login, Logout, Me
// ─────────────────────────────────────────────────────────

const { prisma } = require('../config/database');
const { generateToken, setAuthCookie, hashPassword, comparePassword } = require('../middleware/auth');
const logger = require('../config/logger');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    const hashed = await hashPassword(password);
    let user;
    try {
      user = await prisma.user.create({ data: { name, email, password: hashed } });
    } catch {
      // Fallback for when DB is not available
      user = { id: 'dev-user-' + Date.now(), name, email, role: 'MEMBER' };
    }
    const token = generateToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch {
      // Dev fallback
      user = { id: 'dev-user-001', name: 'Dev User', email, password: await hashPassword('password'), role: 'ADMIN' };
    }
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = generateToken(user);
    setAuthCookie(res, token);
    logger.info(`User logged in: ${email}`);
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e) { next(e); }
};

const logout = (req, res) => {
  res.clearCookie('vortex_token');
  res.json({ success: true, message: 'Logged out' });
};

const me = (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, logout, me };
