// ─────────────────────────────────────────────────────────
// Vortex Workspace — Production Server v4
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

const logger = require('./src/config/logger');
const { connectDB } = require('./src/config/database');
const { createRedisClient } = require('./src/config/redis');
const { initSentry } = require('./src/config/sentry');

const authRoutes = require('./src/routes/authRoutes');
const workspaceRoutes = require('./src/routes/workspaceRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const summarizeRoutes = require('./src/routes/summarizeRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { setIO } = require('./src/config/socket');

const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const clientDist = path.join(__dirname, 'client', 'dist');

const sentry = initSentry(app);

app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'ws:', 'wss:'],
          },
        }
      : false,
  })
);
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || (isProd ? false : 'http://localhost:5173'),
    credentials: true,
  })
);
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-cookie-secret-change-me'));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));

app.use('/v1/api', apiLimiter);
app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/workspace', workspaceRoutes);
app.use('/v1/api/tasks', taskRoutes);
app.use('/v1/api/analytics', analyticsRoutes);
app.use('/v1/api/summarize', summarizeRoutes);
app.use('/v1/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vortex-workspace',
    version: '4.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

if (isProd) {
  app.use(express.static(clientDist, { maxAge: '1d' }));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Vortex API running. Start the client: cd client && npm run dev',
      api: '/v1/api',
    });
  });
}

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

const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});
setIO(io);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user:online', (user) => {
    if (user?.id) socket.join(`user:${user.id}`);
    onlineUsers.set(socket.id, { ...user, socketId: socket.id, lastSeen: new Date() });
    io.emit('collaborators:update', Array.from(onlineUsers.values()));
  });

  socket.on('workspace:join', (workspaceId) => {
    if (workspaceId) socket.join(`workspace:${workspaceId}`);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('collaborators:update', Array.from(onlineUsers.values()));
  });
});

async function bootstrap() {
  await connectDB();
  createRedisClient();

  server.listen(PORT, () => {
    logger.info(`\n  Vortex Workspace v4.0`);
    logger.info(`  Server:  http://localhost:${PORT}`);
    logger.info(`  API:     http://localhost:${PORT}/v1/api`);
    if (!isProd) logger.info(`  Client:  http://localhost:5173 (npm run client:dev)`);
    logger.info(`  Env:     ${process.env.NODE_ENV || 'development'}\n`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io };
