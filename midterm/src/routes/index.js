'use strict';
const {catalog}=require('./catalog');
function register(app,db) {
  const {auth,asyncRoute}=require('../middleware');
  for(const op of catalog)app[op.method](op.path,auth(db,op),asyncRoute(async(req,res)=>{
    const result=await require('../controllers/api').dispatch(db,req,op);
    const paginated=result&&Array.isArray(result.data)&&result.meta;
    res.status(op.mode==='create'||['reservationCreate','evaluationCreate'].includes(op.operationId)?201:200).json(paginated?{success:true,...result}:{success:true,data:result});
  }));
}
module.exports={register};
