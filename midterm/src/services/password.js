'use strict';
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) require('../validators').fail(422, 'PASSWORD_LENGTH', '비밀번호는 12~128자입니다.');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
async function verify(password, encoded) {
  if (typeof password !== 'string' || password.length > 128 || !encoded) return false;
  const [salt, value] = encoded.split(':');
  const computed = await scrypt(password, salt, 64);
  const expected = Buffer.from(value, 'hex');
  return expected.length === computed.length && crypto.timingSafeEqual(expected, computed);
}
module.exports = { hashPassword, verify };
