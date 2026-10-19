'use strict';
const crypto=require('node:crypto');
const {fail,AppError}=require('../validators');
const {loadActor,requireRoles}=require('../permissions');
const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
function auth(db,op) {return asyncRoute(async(req,res,next)=>{
  if(!op.public){if(!req.session.accountId)fail(401,'LOGIN_REQUIRED','로그인이 필요합니다.');req.actor=await loadActor(db.pool,req.session.accountId,req.session.version);requireRoles(req.actor,op.roles);}
  next();
});}
function csrf(req,res,next) {
  if(['GET','HEAD','OPTIONS'].includes(req.method))return next();
  const actual=req.get('X-CSRF-Token'),expected=req.session.csrf;
  if(!actual||!expected||Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return next(new AppError(403,'CSRF_INVALID','세션 CSRF 토큰이 필요합니다.'));
  next();
}
function errorHandler(error,req,res,next) {
  if(res.headersSent)return next(error);
  let status=error.status||500,code=error.code||'INTERNAL_ERROR',message=error.message;
  if(error.type==='entity.parse.failed'){status=400;code='INVALID_JSON';message='올바르지 않은 JSON입니다.';}
  else if(error.type==='entity.too.large'){status=400;code='BODY_TOO_LARGE';message='요청 본문은 64KB 이하여야 합니다.';}
  else if(error instanceof URIError){status=400;code='INVALID_URL';message='올바르지 않은 URL 인코딩입니다.';}
  else if(error.code==='ER_DUP_ENTRY'){status=409;code='DUPLICATE';message='이미 등록된 관계 또는 고유값입니다.';}
  else if(error.code==='ER_NO_REFERENCED_ROW_2'){status=422;code='INVALID_REFERENCE';message='참조 대상이 없습니다.';}
  else if(error.code==='ER_LOCK_DEADLOCK'||error.code==='ER_LOCK_WAIT_TIMEOUT'){status=409;code='CONCURRENT_CHANGE';message='동시 변경 충돌입니다. 다시 시도하세요.';}
  else if(!(error instanceof AppError)&&error.type!=='entity.parse.failed'){status=503;code='SERVICE_UNAVAILABLE';message='처리 중 오류가 발생했습니다. DB 연결 상태를 확인하고 다시 시도하세요.';}
  res.status(status).json({success:false,error:{code,message,...(error instanceof AppError&&error.details?{details:error.details}:{})}});
}
module.exports={asyncRoute,auth,csrf,errorHandler};
