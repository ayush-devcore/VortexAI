// ─────────────────────────────────────────────────────────
// Database — Prisma Client Singleton
// ─────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

let prisma;
let dbAvailable = false;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ log: ['error'] });
  } else {
    if (!global.__prisma) {
      global.__prisma = new PrismaClient({ log: ['error'] });
    }
    prisma = global.__prisma;
  }
} catch {
  prisma = /** @type {any} */ ({});
}

/**
 * Connect to database with retry logic.
 * Sets `dbAvailable` flag checked by repositories.
 */
async function connectDB() {
  if (!process.env.DATABASE_URL) {
    logger.info('⚠️  No DATABASE_URL — running in fallback mode (in-memory data)');
    return;
  }
  try {
    await prisma.$connect();
    dbAvailable = true;
    logger.info('✅ Database connected (PostgreSQL via Prisma)');
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error.message}`);
    logger.info('⚠️  Running in fallback mode (in-memory data)');
  }
}

/** Check if DB is available (no network call — cached flag) */
function isDBAvailable() {
  return !!process.env.DATABASE_URL;
}

async function disconnectDB() {
  if (dbAvailable) {
    await prisma.$disconnect();
    dbAvailable = false;
    logger.info('Database disconnected');
  }
}

module.exports = { prisma, connectDB, disconnectDB, isDBAvailable };
