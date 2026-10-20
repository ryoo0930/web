'use strict';
const {fields}=require('../validators');
async function dispatch(db,req,op) {
  if(op.entity) {
    const service=require('../services/entities');
    if(op.mode==='list')return service.list(db,req.actor,op.entity,req.query);
    if(op.mode==='detail')return service.detail(db,req.actor,op.entity,req.params.id);
    return service.mutate(db,req.actor,op.entity,op.mode,req.params.id,req.body||{});
  }
  const input=fields(req.body||{},op.input);
  if(op.group==='auth')return require('../services/auth').execute(db,req,op.operationId,input);
  const service=op.group==='evaluations'||op.operationId.endsWith('History')||['activityFeed','auditLog'].includes(op.operationId)
    ? 'records' : op.group==='reports' ? 'reports' : 'operations';
  return require(`../services/${service}`).execute(db,req,op,input);
}
module.exports={dispatch};
