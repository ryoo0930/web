'use strict';
class AppError extends Error {
  constructor(status, code, message, details) { super(message); Object.assign(this, { status, code, details }); }
}
function fail(status, code, message, details) { throw new AppError(status, code, message, details); }
function id(value) { if (!/^[1-9]\d{0,14}$/.test(String(value))) fail(400, 'INVALID_ID', '양의 정수 ID가 필요합니다.'); return Number(value); }
function text(value, max = 2000) { if (typeof value !== 'string' || !value.trim() || value.length > max) fail(422, 'INVALID_TEXT', `1~${max}자 문자열이 필요합니다.`); return value.trim(); }
function fields(body, schema, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'INVALID_BODY', 'JSON 객체가 필요합니다.');
  for (const key of Object.keys(body)) if (!Object.hasOwn(schema, key)) fail(422, 'UNKNOWN_FIELD', `허용되지 않은 필드: ${key}`);
  const result = {};
  for (const [key, spec] of Object.entries(schema)) {
    const value = body[key];
    if (value === undefined) { if (spec.required && !partial) fail(422, 'REQUIRED', `${key} 필수`); continue; }
    if (spec.type === 'id') result[key] = id(value);
    else if (spec.type === 'boolean') { if (typeof value !== 'boolean') fail(422, 'INVALID_BOOLEAN', key); result[key] = value; }
    else if (spec.type === 'number') { if (typeof value !== 'number' || !Number.isFinite(value) || value < (spec.min ?? 0) || value > (spec.max ?? 1000000)) fail(422, 'INVALID_NUMBER', key); result[key] = value; }
    else if (spec.type === 'date') { if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) fail(422, 'INVALID_DATE', `${key}: 시간대가 있는 ISO 날짜 필요`); result[key] = new Date(value).toISOString().slice(0, 23).replace('T', ' '); }
    else if (spec.enum) { if (!spec.enum.includes(value)) fail(422, 'INVALID_ENUM', `${key}: ${spec.enum.join(', ')}`); result[key] = value; }
    else result[key] = text(value, spec.max || 2000);
  }
  if (partial && !Object.keys(result).length) fail(422, 'EMPTY_UPDATE', '수정할 값이 없습니다.');
  return result;
}
function interval(start, end) { if (!(start < end)) fail(422, 'INVALID_INTERVAL', '시작은 종료보다 빨라야 합니다.'); }
function page(query) { const p = query.page === undefined ? 1 : id(query.page); const size = query.size === undefined ? 20 : id(query.size); if (size > 100 || p > 100000) fail(422, 'PAGE_LIMIT', 'size ≤ 100, page ≤ 100000'); return { page: p, size, offset: (p - 1) * size }; }
module.exports = { AppError, fail, id, text, fields, interval, page };
