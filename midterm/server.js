'use strict';
const PORT = 8593;
async function startServer() {
  const config = require('./src/config').loadConfig();
  const db = await require('./src/database').initialize(config);
  const app = require('./src/app').createApp(db, config);
  let server;
  try {
    server = await new Promise((resolve, reject) => {
      const listener = app.listen(PORT, '0.0.0.0', () => resolve(listener));
      listener.once('error', reject);
    });
  } catch (error) { await db.close(); throw error; }
  const stopWorker = require('./src/jobs/outbox').startWorker(db);
  console.log('The Family: http://localhost:8593 (Swagger: /api-docs)');
  let closing = false;
  const shutdown = async () => {
    if (closing) return; closing = true;
    await new Promise(resolve => server.close(resolve));
    await stopWorker(); await db.close();
  };
  process.once('SIGINT', () => shutdown().catch(() => { process.exitCode = 1; }));
  process.once('SIGTERM', () => shutdown().catch(() => { process.exitCode = 1; }));
  return { app, server, shutdown };
}
function startupError(error) {
  console.error(error.code === 'EADDRINUSE'
    ? '8593 포트가 사용 중입니다. 사용자가 기존 프로그램을 확인하고 종료한 뒤 다시 실행하세요. 포트 자동 변경은 하지 않습니다.'
    : '초기화 실패: MySQL/MongoDB 실행 상태, .env 연결 설정 및 CREATE/SELECT/INSERT/UPDATE/DELETE/INDEX 권한을 확인하세요. 기존 DB에는 CREATE DATABASE 권한이 필요하지 않습니다.');
  console.error('오류 분류:', /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'INITIALIZATION_ERROR');
  process.exitCode = 1;
}
module.exports = { startServer, startupError, PORT };
if (require.main === module) startServer().catch(startupError);
