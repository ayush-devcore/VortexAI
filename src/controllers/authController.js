const authService = require('../services/authService');
const { setAuthCookies, clearAuthCookies, extractRefreshToken } = require('../middleware/auth');
const logger = require('../config/logger');

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken, verification } = await authService.register(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    logger.info(`User registered: ${user.email}`);
    res.status(201).json({ success: true, data: user, verification });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(extractRefreshToken(req));
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out' });
  } catch (e) {
    next(e);
  }
};

const refresh = async (req, res, next) => {
  try {
    const oldToken = extractRefreshToken(req);
    if (!oldToken) return res.status(401).json({ success: false, error: 'Refresh token required' });
    const result = await authService.rotateRefreshToken(oldToken);
    if (!result) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({ success: true, data: result.user });
  } catch (e) {
    next(e);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    clearAuthCookies(res);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token required' });
    const user = await authService.verifyEmail(token);
    res.json({ success: true, data: user, message: 'Email verified successfully' });
  } catch (e) {
    next(e);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const verification = await authService.resendVerification(req.user.id);
    res.json({ success: true, verification, message: 'Verification email sent' });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  me,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerification,
};
