'use strict';
const {catalog}=require('../routes/catalog');
function schema(spec) {
  return {type:spec.type==='id'?'integer':spec.type==='date'?'string':spec.type==='number'?'number':spec.type||'string',...(spec.type==='id'?{minimum:1}:{}),...(spec.type==='date'?{format:'date-time'}:{}),...(spec.enum?{enum:spec.enum}:{}),...(spec.type==='string'&&spec.max?{maxLength:spec.max}:{}),...(spec.min!==undefined?{minimum:spec.min}:{}),...(spec.type==='number'&&spec.max!==undefined?{maximum:spec.max}:{})};
}
function example(input) {return Object.fromEntries(Object.entries(input).map(([key,s])=>[key,s.enum?s.enum[0]:s.type==='id'?1:s.type==='number'?s.min||1:s.type==='boolean'?true:s.type==='date'?(key.includes('end')?'2026-11-01T11:00:00+09:00':'2026-11-01T10:00:00+09:00'):key.includes('password')?'Example-Password-2026!':key==='username'?'admin':key==='email'?'member@example.test':key==='reason'?'운영 일정 조정':key==='version'?1:`${key} 입력 예시`]));}
function buildOpenApi() {
  const paths={};
  for(const op of catalog) {
    const path=op.path.replace(/:([A-Za-z]+)/g,'{$1}');paths[path]||={};
    const parameters=[];
    for(const [location,definitions] of Object.entries(op.parameters))for(const [name,definition] of Object.entries(definitions))parameters.push({name,in:location==='headers'?'header':location,required:!!definition.required,schema:{...schema(definition),...(name==='size'?{maximum:100}:{}),...(name==='page'?{maximum:100000}:{})},description:location==='path'?'생성 또는 목록 API의 실제 반환 ID':location==='headers'?'GET /auth/csrf 또는 로그인 응답의 csrfToken':name==='size'?'페이지 크기 최대 100':name==='from'||name==='to'?'시간대 포함 ISO 날짜. 업무 목록은 일정, 자원 사용 통계는 예약 기간, 부하 통계는 업무 일정, 그 외는 생성 시각.':`${name} 검색/조회 조건`});
    const success=op.mode==='create'||['reservationCreate','evaluationCreate'].includes(op.operationId)?'201':'200';
    const responses={[success]:{description:'요청 처리 완료. 실제 DB 값 반환.',content:{'application/json':{schema:{$ref:'#/components/schemas/Success'},example:op.responses.success}}}};
    for(const [code,msg] of [[400,'잘못된 JSON/ID'],[401,'인증 필요 또는 세션 만료'],[403,'역할/대상 범위/CSRF 거부'],[404,'대상 없음'],[409,'상태·중복·일정·버전 충돌'],[422,'허용 필드·입력 검증 실패'],[503,'DB/처리 서비스 장애']]) {
      responses[code]={description:msg,content:{'application/json':{
        schema:{$ref:'#/components/schemas/Error'},
        example:{success:false,error:{code:`HTTP_${code}`,message:msg}}
      }}};
    }
    const required=op.mode==='update'?[]:Object.entries(op.input).filter(([,s])=>s.required).map(([key])=>key);
    paths[path][op.method]={operationId:op.operationId,summary:op.title,description:`${op.purpose}\n\n허용 역할: ${op.roles.join(', ')}. 대상 범위: ${op.scope}. 요구사항: ${op.requirements.join(', ')}. ${op.difference}. 구현 후 실행 검증은 미실행.`,tags:[op.group],security:op.public?[]:[{sessionCookie:[]}],parameters,responses,...(Object.keys(op.input).length?{requestBody:{required:true,content:{'application/json':{schema:{type:'object',additionalProperties:false,properties:Object.fromEntries(Object.entries(op.input).map(([key,s])=>[key,schema(s)])),required},example:example(op.input)}}}}:{})};
  }
  return {openapi:'3.0.3',info:{title:'The Family API',version:'1.0.0',description:'로그인 화면에서 로그인하면 같은 브라우저의 Swagger가 세션을 공유합니다. X-CSRF-Token은 UI가 자동 확보합니다. 직접 호출은 GET /api/v1/auth/csrf → POST login → 로그인 응답의 새 토큰 사용. 필드 예시의 ID=1은 실제 ID로 반드시 교체하세요.'},servers:[{url:'http://localhost:8593'}],paths,components:{securitySchemes:{sessionCookie:{type:'apiKey',in:'cookie',name:'fm.sid'}},schemas:{Success:{type:'object',properties:{success:{type:'boolean'},data:{},meta:{type:'object'}}},Error:{type:'object',properties:{success:{type:'boolean'},error:{type:'object',properties:{code:{type:'string'},message:{type:'string'},details:{}}}}}}}};
}
module.exports={buildOpenApi,example};
