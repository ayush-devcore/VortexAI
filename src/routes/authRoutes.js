const express = require('express');
const {
  register,
  login,
  logout,
  refresh,
  me,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh', authLimiter, refresh);
router.post('/verify-email', verifyEmail);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);
router.post('/resend-verification', requireAuth, resendVerification);

module.exports = router;
