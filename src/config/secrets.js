const crypto = require('crypto');
const logger = require('./logger');

const isProd = process.env.NODE_ENV === 'production';
const generatedDevSecrets = new Map();

function getSecret(name, description) {
  const configured = process.env[name];
  if (configured) return configured;

  if (isProd) {
    throw new Error(`${name} is required in production for ${description}`);
  }

  if (!generatedDevSecrets.has(name)) {
    generatedDevSecrets.set(name, crypto.randomBytes(48).toString('hex'));
    logger.warn(`${name} is not set; generated a temporary development-only ${description}`);
  }

  return generatedDevSecrets.get(name);
}

module.exports = {
  JWT_SECRET: getSecret('JWT_SECRET', 'JWT signing secret'),
  COOKIE_SECRET: getSecret('COOKIE_SECRET', 'cookie signing secret'),
};

