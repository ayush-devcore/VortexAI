const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../middleware/auth');
const logger = require('../config/logger');
const notificationService = require('./notificationService');
const { JWT_SECRET } = require('../config/secrets');

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const PASSWORD_RULES = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};

function validatePassword(password) {
  if (!password || password.length < PASSWORD_RULES.minLength) {
    return 'Password must be at least 8 characters';
  }
  if (!PASSWORD_RULES.pattern.test(password)) {
    return 'Password must include uppercase, lowercase, and a number';
  }
  return null;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function userSelect() {
  return {
    id: true,
    name: true,
    email: true,
    role: true,
    avatar: true,
    emailVerified: true,
    createdAt: true,
  };
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString('hex');
}

function generateEmailToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function createRefreshToken(userId) {
  const token = generateRefreshTokenValue();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

async function revokeRefreshToken(token) {
  await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
}

async function rotateRefreshToken(oldToken) {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!record || record.revoked || record.expiresAt < new Date()) return null;
  await revokeRefreshToken(oldToken);
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return null;
  const newRefresh = await createRefreshToken(user.id);
  const accessToken = generateAccessToken(user);
  return { user, accessToken, refreshToken: newRefresh.token };
}

async function createDefaultWorkspace(userId, userName) {
  return prisma.workspace.create({
    data: {
      name: `${userName.split(' ')[0]}'s Workspace`,
      description: 'Your personal workspace',
      ownerId: userId,
      members: { create: { userId, role: 'ADMIN' } },
    },
  });
}

async function sendVerificationEmail(user) {
  const token = generateEmailToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: token, emailVerifyExpires: expires },
  });
  const link = `${APP_URL}/verify-email?token=${token}`;
  logger.info(`Verify email for ${user.email}: ${link}`);
  return { token, link, devOnly: process.env.NODE_ENV !== 'production' ? link : undefined };
}

async function register({ name, email, password }) {
  if (!name?.trim()) throw Object.assign(new Error('Name is required'), { status: 400 });
  if (!validateEmail(email)) throw Object.assign(new Error('Invalid email address'), { status: 400 });
  const pwErr = validatePassword(password);
  if (pwErr) throw Object.assign(new Error(pwErr), { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase(), password: hashed },
    select: userSelect(),
  });

  await createDefaultWorkspace(user.id, user.name);
  const verify = await sendVerificationEmail(user);

  const accessToken = generateAccessToken(user);
  const refresh = await createRefreshToken(user.id);
  return { user, accessToken, refreshToken: refresh.token, verification: verify };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw Object.assign(new Error('Email and password are required'), { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const valid = await comparePassword(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
  };
  const accessToken = generateAccessToken(safeUser);
  const refresh = await createRefreshToken(user.id);
  return { user: safeUser, accessToken, refreshToken: refresh.token };
}

async function logout(refreshToken) {
  if (refreshToken) await revokeRefreshToken(refreshToken);
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: userSelect() });
}

async function updateProfile(userId, { name, avatar }) {
  const data = {};
  if (name?.trim()) data.name = name.trim();
  if (avatar !== undefined) data.avatar = avatar || null;
  if (!Object.keys(data).length) {
    throw Object.assign(new Error('No valid fields to update'), { status: 400 });
  }
  return prisma.user.update({ where: { id: userId }, data, select: userSelect() });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const pwErr = validatePassword(newPassword);
  if (pwErr) throw Object.assign(new Error(pwErr), { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  await prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
  return { message: 'Password updated. Please sign in again.' };
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token, emailVerifyExpires: { gt: new Date() } },
  });
  if (!user) throw Object.assign(new Error('Invalid or expired verification link'), { status: 400 });
  return prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
    select: userSelect(),
  });
}

async function resendVerification(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.emailVerified) throw Object.assign(new Error('Email already verified'), { status: 400 });
  return sendVerificationEmail(user);
}

module.exports = {
  validatePassword,
  validateEmail,
  generateAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  register,
  login,
  logout,
  getUserById,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerification,
};
