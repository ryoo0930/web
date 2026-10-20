'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const mysql=require('mysql2/promise');
const {MongoClient}=require('mongodb');
const root=path.resolve(__dirname,'..');
async function main() {
  const local=path.join(root,'.local');
  // Only provision the dedicated MySQL instance created by start-databases.ps1.
  if(!fs.existsSync(path.join(local,'mysql-data','mysql')))throw new Error('Dedicated MySQL data directory not found. Run scripts/start-databases.ps1 first.');
  const envPath=path.join(root,'.env');
  if(!fs.existsSync(envPath)) {
    const password=crypto.randomBytes(24).toString('hex');
    fs.writeFileSync(envPath,`MYSQL_HOST=127.0.0.1\nMYSQL_PORT=3306\nMYSQL_USER=student\nMYSQL_PASSWORD=${password}\nMYSQL_DB=mysql_202211205\nMONGO_URL=mongodb://127.0.0.1:27017\nMONGO_DB=mongo_202211205\nDEMO_SEED=false\nCOOKIE_SECURE=false\n`,{flag:'wx',mode:0o600});
  }
  const config=require('../src/config').loadConfig();
  if(config.mysql.host!=='127.0.0.1'||config.mysql.port!==3306)throw new Error('This setup only supports the dedicated local MySQL instance on 127.0.0.1:3306.');
  const rootPasswordFile=path.join(local,'mysql-root-password');
  if(!fs.existsSync(rootPasswordFile))fs.writeFileSync(rootPasswordFile,crypto.randomBytes(32).toString('hex'),{flag:'wx',mode:0o600});
  const rootPassword=fs.readFileSync(rootPasswordFile,'utf8');
  let connection;
  try {connection=await mysql.createConnection({host:'127.0.0.1',user:'root',password:rootPassword});}
  catch(error) {
    if(error.code!=='ER_ACCESS_DENIED_ERROR')throw error;
    connection=await mysql.createConnection({host:'127.0.0.1',user:'root',password:''});
    await connection.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?",[rootPassword]);
  }
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.mysql.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query("CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?",[config.mysql.user,config.mysql.password]);
    await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON \`${config.mysql.database}\`.* TO ?@'localhost'`,[config.mysql.user]);
  } finally {await connection.end();}
  const user=await mysql.createConnection(config.mysql);await user.query('SELECT 1');await user.end();
  const mongo=new MongoClient(config.mongoUrl,{serverSelectionTimeoutMS:5000});
  try {await mongo.connect();await mongo.db(config.mongoDb).command({ping:1});}finally{await mongo.close();}
  console.log('Local DB account, database, permissions and .env ready. MySQL and MongoDB connection checks passed.');
}
main().catch(error=>{console.error('Local DB setup failed:',error.code||error.name);process.exitCode=1;});
