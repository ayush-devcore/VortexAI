// ─────────────────────────────────────────────────────────
// Vortex Workspace — Production Server
// ─────────────────────────────────────────────────────────

require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Server: SocketServer } = require('socket.io');

// Config
const logger = require('./src/config/logger');
const { connectDB } = require('./src/config/database');
const { createRedisClient } = require('./src/config/redis');
const { initSentry } = require('./src/config/sentry');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const workspaceRoutes = require('./src/routes/workspaceRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const summarizeRoutes = require('./src/routes/summarizeRoutes');

// Middleware
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ── Sentry (before routes) ──────────────────────────────
const sentry = initSentry(app);

// ── Security Middleware ─────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://unpkg.com"],
    },
  },
}));
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-cookie-secret'));

// ── Parsing & Logging ───────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ── Static Files ────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// ── Rate Limiting (global) ──────────────────────────────
app.use('/v1/api', apiLimiter);

// ── API Routes ──────────────────────────────────────────
app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/workspace', workspaceRoutes);
app.use('/v1/api/tasks', taskRoutes);
app.use('/v1/api/analytics', analyticsRoutes);
app.use('/v1/api/summarize', summarizeRoutes);

// ── Health Check (Load Balancer) ────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vortex-workspace',
    version: '3.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
  });
});

// ── Catch-all: SPA ──────────────────────────────────────
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  sentry.captureException(err);
  logger.error(`[${status}] ${err.message}`, { path: req.path, method: req.method });

  res.status(status).json({
    success: false,
    error: {
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
});

// ── Socket.io — Real-time Collaboration ─────────────────
const io = new SocketServer(server, {
  cors: { 
      origin: "*", // Allow all origins during dev
      methods: ["GET", "POST"]
  },
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id}`);

  socket.on('user:online', (user) => {
    onlineUsers.set(socket.id, { ...user, socketId: socket.id, lastSeen: new Date() });
    io.emit('collaborators:update', Array.from(onlineUsers.values()));
  });

  socket.on('workspace:join', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    logger.debug(`${socket.id} joined workspace:${workspaceId}`);
  });

  socket.on('task:update', (data) => {
    socket.to(`workspace:${data.workspaceId}`).emit('task:changed', data);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('collaborators:update', Array.from(onlineUsers.values()));
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// ── Bootstrap ───────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  createRedisClient();

  server.listen(PORT, () => {
    logger.info(`\n  ⚡ Vortex Workspace v3.0 (Production)`);
    logger.info(`  ─────────────────────────────────────`);
    logger.info(`  → Server:     http://localhost:${PORT}`);
    logger.info(`  → API:        http://localhost:${PORT}/v1/api`);
    logger.info(`  → Health:     http://localhost:${PORT}/health`);
    logger.info(`  → WebSocket:  ws://localhost:${PORT}`);
    logger.info(`  → Env:        ${process.env.NODE_ENV || 'development'}`);
    logger.info(`  → Status:     Running ✓\n`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io };
