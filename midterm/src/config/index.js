'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
function loadConfig() {
  const root = path.resolve(__dirname, '../..');
  require('dotenv').config({ path: path.join(root, '.env') });
  const env = process.env;
  const mysqlDb = env.MYSQL_DB || 'mysql_202211205';
  const mongoDb = env.MONGO_DB || 'mongo_202211205';
  for (const name of [mysqlDb, mongoDb]) {
    if (!/^[a-zA-Z0-9_]*202211205[a-zA-Z0-9_]*$/.test(name)) throw new Error('Invalid database name');
  }
  const local = path.join(root, '.local'); fs.mkdirSync(local, { recursive: true, mode: 0o700 });
  const secretFile = path.join(local, 'session-secret');
  if (!env.SESSION_SECRET && !fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(48).toString('hex'), { mode: 0o600, flag: 'wx' });
  const secret = env.SESSION_SECRET || fs.readFileSync(secretFile, 'utf8');
  if (secret.length < 32) throw new Error('Session secret too short');
  const port = Number(env.MYSQL_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid MySQL port');
  return { root, local, secret, demo: env.DEMO_SEED === 'true', initialPassword: env.INITIAL_PASSWORD,
    secure: env.COOKIE_SECURE === 'true', mongoUrl: env.MONGO_URL || 'mongodb://127.0.0.1:27017', mongoDb,
    mysql: { host: env.MYSQL_HOST || '127.0.0.1', port, user: env.MYSQL_USER || 'student', password: env.MYSQL_PASSWORD || 'student', database: mysqlDb, timezone: 'Z', dateStrings: true, connectionLimit: 10, charset: 'utf8mb4' } };
}
module.exports = { loadConfig };
