'use strict';
const path=require('node:path');
function createApp(db,config) {
  const express=require('express'),session=require('express-session'),helmet=require('helmet');
  const {asyncRoute,csrf,errorHandler}=require('./middleware');
  const {catalog}=require('./routes/catalog'),{entities}=require('./routes/entities');
  const {loadActor}=require('./permissions');
  const app=express();app.disable('x-powered-by');
  app.set('view engine','ejs');app.set('views',path.join(config.root,'views'));
  app.use(helmet({contentSecurityPolicy:false}));
  app.use((req,res,next)=>{if(!req.path.startsWith('/api-docs'))res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");next();});
  app.use(express.json({limit:'64kb'}));
  app.use(session({name:'fm.sid',secret:config.secret,store:require('./database/session-store')(db.pool),resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:config.secure,maxAge:8*3600000}}));
  app.use('/api',csrf);
  app.use('/assets',express.static(path.join(config.root,'public'),{dotfiles:'deny',index:false}));
  app.get('/login',(req,res)=>res.render('login'));
  app.get('/openapi.json',(req,res)=>res.json(require('./docs/openapi').buildOpenApi()));
  const swagger=require('swagger-ui-express');
  app.use('/api-docs',swagger.serve,swagger.setup(require('./docs/openapi').buildOpenApi(),{customSiteTitle:'The Family API',swaggerOptions:{persistAuthorization:false,withCredentials:true,requestInterceptor:function(request){
    request.credentials='same-origin';
    if(request.url.includes('/api/v1/')&&!['GET','HEAD','OPTIONS'].includes(request.method.toUpperCase()))return fetch('/api/v1/auth/csrf',{credentials:'same-origin'}).then(function(response){return response.json();}).then(function(result){request.headers['X-CSRF-Token']=result.data.csrfToken;return request;});
    return request;
  }}}));
  require('./routes').register(app,db);
  const render=asyncRoute(async(req,res)=>{
    if(!req.session.accountId)return res.redirect('/login');
    let actor;try{actor=await loadActor(db.pool,req.session.accountId,req.session.version);}catch(e){if(e.status===401)return res.redirect('/login');throw e;}
    const section=req.params.section||'dashboard';
    const allowed=new Set(['dashboard','profile','assigned','evaluations','activity','reports','admin',...Object.keys(entities)]);
    if(!allowed.has(section))return res.status(404).render('error',{message:'화면을 찾을 수 없습니다.'});
    if(section==='admin'&&actor.role!=='Administrator')return res.status(403).render('error',{message:'관리자 권한이 필요합니다.'});
    if(entities[section]&&!entities[section].read.includes(actor.role))return res.status(403).render('error',{message:'이 화면에 접근할 수 없습니다.'});
    res.render('workspace',{actor,section,entities,operations:catalog.filter(o=>!o.public&&o.roles.includes(actor.role)),title:entities[section]?.label||({dashboard:'운영 대시보드',profile:'내 정보',assigned:'내 배정 업무',evaluations:'평가와 성장',activity:'활동 기록',reports:'운영 통계',admin:'계정 및 감사 관리'})[section]});
  });
  app.get('/',render);app.get('/workspace/:section',render);
  app.use((req,res)=>res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'경로가 없습니다.'}}));
  app.use(errorHandler);return app;
}
module.exports={createApp};
