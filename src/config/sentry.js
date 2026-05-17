// ─────────────────────────────────────────────────────────
// Sentry — Error Tracking (Mock Configuration)
// ─────────────────────────────────────────────────────────
// To activate: npm install @sentry/node and uncomment below.
// ─────────────────────────────────────────────────────────

const logger = require('./logger');

function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn || dsn.includes('example')) {
    logger.info('⚠️  Sentry: No valid DSN — error tracking disabled');
    return {
      captureException: (err) => logger.error(`[Sentry Mock] ${err.message}`),
      captureMessage: (msg) => logger.warn(`[Sentry Mock] ${msg}`),
    };
  }

  // Uncomment when @sentry/node is installed:
  // const Sentry = require('@sentry/node');
  // Sentry.init({ dsn, environment: process.env.NODE_ENV, tracesSampleRate: 0.2 });
  // app.use(Sentry.Handlers.requestHandler());
  // return Sentry;

  logger.info('✅ Sentry configured (mock mode)');
  return {
    captureException: (err) => logger.error(`[Sentry] ${err.message}`, { stack: err.stack }),
    captureMessage: (msg, level) => logger.log(level || 'info', `[Sentry] ${msg}`),
  };
}

module.exports = { initSentry };
