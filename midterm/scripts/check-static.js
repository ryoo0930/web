'use strict';
// Syntax and file-reference inspection only; no application/DB initialization or handler calls.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=[...['src','public','scripts','views'].flatMap(dir=>walk(path.join(root,dir))),path.join(root,'app.js'),path.join(root,'server.js')];
let js=0,ejs=0,refs=0;const errors=[];
for(const file of files) {
  const source=fs.readFileSync(file,'utf8');
  if(file.endsWith('.js')) {
    js++;const checked=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(checked.status!==0)errors.push(checked.stderr);
    for(const match of source.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)){refs++;try{require.resolve(path.resolve(path.dirname(file),match[1]));}catch{errors.push(`누락 import: ${file}: ${match[1]}`);}}
  }
  if(file.endsWith('.ejs')){ejs++;try{require('ejs').compile(source,{filename:file});}catch(error){errors.push(`${file}: ${error.message}`);}}
}
const result={javascriptFiles:js,ejsTemplates:ejs,relativeImports:refs,errors};
fs.writeFileSync(path.join(root,'docs/static-checks.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
