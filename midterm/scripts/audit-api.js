'use strict';
// Static registration audit only. Do not import server.js or createApp/initialize.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {catalog}=require('../src/routes/catalog');
const {buildOpenApi}=require('../src/docs/openapi');
function audit() {
  const registrations=[];const fake={};for(const method of ['get','post','patch','put','delete'])fake[method]=(route,...handlers)=>registrations.push({method,path:route,handlers});
  require('../src/routes').register(fake,{});
  const errors=[],keys=new Set(),ids=new Set(),openapi=buildOpenApi();
  for(const op of catalog) {
    const key=op.method+' '+op.path.replace(/:[A-Za-z]+/g,':id');
    if(keys.has(key))errors.push('중복 경로 '+key);keys.add(key);
    if(ids.has(op.operationId))errors.push('중복 operationId '+op.operationId);ids.add(op.operationId);
    if(!op.requirements.length)errors.push('요구사항 누락 '+op.operationId);
    const doc=openapi.paths[op.path.replace(/:([A-Za-z]+)/g,'{$1}')];if(!doc?.[op.method])errors.push('OpenAPI 누락 '+op.operationId);
    const [file,fn]=op.implementation.split('#');if(!fs.existsSync(path.join(root,file)))errors.push('구현 파일 누락 '+file);else if(typeof require(path.join(root,file))[fn]!=='function')errors.push('구현 export 누락 '+op.operationId);
    const registration=registrations.find(r=>r.method===op.method&&r.path===op.path);if(!registration||registration.handlers.some(h=>typeof h!=='function'))errors.push('핸들러 등록 누락 '+op.operationId);
    for(const required of ['purpose','scope','database','manual','difference','status'])if(!op[required])errors.push('메타데이터 누락 '+op.operationId+':'+required);
    for(const file of ['api-spec.md','technical-report.md','technical-report.html','manual-checks.md']) {
      const filename=path.join(root,'docs',file);
      if(!fs.existsSync(filename)||!fs.readFileSync(filename,'utf8').includes(op.operationId))errors.push(`${file} API 누락 ${op.operationId}`);
    }
  }
  const diskFile=path.join(root,'docs/api-catalog.json');
  if(fs.existsSync(diskFile)) {const disk=JSON.parse(fs.readFileSync(diskFile,'utf8'));if(JSON.stringify(disk)!==JSON.stringify(catalog))errors.push('생성 카탈로그가 현재 소스와 다름');}
  const candidates=catalog.filter(o=>!o.duplicateReview),suspects=catalog.filter(o=>o.duplicateReview);
  if(candidates.length<200)errors.push('유효 후보 200개 미달');
  return {registrations:registrations.length,normalizedRoutes:keys.size,operationIds:ids.size,candidates:candidates.length,suspects:suspects.map(o=>({operationId:o.operationId,title:o.title,note:o.countingNote})),errors};
}
if(require.main===module) {
  const result=audit();
  const md=`# API 정적 점검\n\n실제 Express 앱/서버/DB는 생성하지 않고 등록 함수에 기록용 객체를 전달했다. 핸들러 실행, HTTP 및 기능 테스트는 미실행이다.\n\n- 등록 method+path: ${result.registrations}\n- 정규화 경로 수: ${result.normalizedRoutes}\n- 고유 operationId: ${result.operationIds}\n- 의미 중복 의심 제외 유효 후보: ${result.candidates}\n- 보수적 제외: ${result.suspects.length}\n- 정적 오류: ${result.errors.length}\n\n카탈로그, OpenAPI, 기능 요구사항, 구현 파일/export, 등록 핸들러 존재를 확인했다. 이 결과는 기능 정확성·DB 동작·최종 채점 인정을 보장하지 않는다. CRUD의 개체별 독립성과 설계 확장의 과제 적합성은 원문 대조/검토가 필요하다.\n\n## 중복 의심 및 계수 제외\n\n| operationId | 기능 | 제외 이유 |\n|---|---|---|\n${result.suspects.map(x=>`| ${x.operationId} | ${x.title} | ${x.note} |`).join('\n')}\n\n## 정적 오류\n\n${result.errors.length?result.errors.map(e=>'- '+e).join('\n'):'없음'}\n`;
  fs.writeFileSync(path.join(root,'docs/api-audit.md'),md);console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1;
}
module.exports={audit};
