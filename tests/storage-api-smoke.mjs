// Creates isolated INACTIVE test module/class; deletes only these generated fixtures.
import {readFileSync} from 'node:fs';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import {signUploadTicket,signServiceTicket} from '../server/storage/uploadProtocol.js';
dotenv.config({quiet:true});
const config=JSON.parse(readFileSync(new URL('../.env.storage.local',import.meta.url),'utf8'));
const api='https://inavet-api.onrender.com';
const gateway='https://inavet.com.ar/material-storage.php';
let token;
async function request(path,method='GET',body) {
  const r=await fetch(api+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});
  const d=await r.json();if(!r.ok||!d.success)throw Error(`${method} ${path} ${r.status}: ${d.message}`);return d.data;
}
async function storage(action,ticket,body,headers={}) {
  const r=await fetch(gateway+'?action='+action,{method:'POST',headers:{'X-Storage-Token':ticket,...headers},body,signal:AbortSignal.timeout(90000)});
  const d=await r.json();if(!r.ok||!d.success)throw Error(`storage ${action}: ${d.message}`);return d.data;
}
const suffix=randomBytes(6).toString('hex');let mod,lesson,material,uploadId;let created=false;
try {
  const login=await request('/api/auth/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD});token=login.token;
  mod=await request('/api/admin/modules','POST',{title:'PRUEBA TEMPORAL STORAGE '+suffix,status:'INACTIVE',order:9999});
  lesson=await request('/api/admin/lessons','POST',{moduleId:mod._id,title:'PRUEBA TEMPORAL STORAGE '+suffix,status:'INACTIVE',order:9999});
  const data=Buffer.from('%PDF-1.7\n% INAVET integration test\n%%EOF\n');
  uploadId=randomBytes(16).toString('hex');
  const ticket=signUploadTicket({uploadId,adminId:login.user.id||login.user._id,lessonId:lesson._id,name:'prueba-integracion.pdf',size:data.length},config.secret);
  await storage('create',ticket);created=true;
  await storage('chunk',ticket,data,{'Content-Type':'application/octet-stream','X-Chunk-Index':'0','X-Chunk-SHA256':createHash('sha256').update(data).digest('hex')});
  material=await request('/api/storage/finish','POST',{ticket,title:'PRUEBA TEMPORAL '+suffix});
  const repeated=await request('/api/storage/finish','POST',{ticket,title:'PRUEBA TEMPORAL '+suffix});assert.equal(repeated._id,material._id);
  const {url}=await request(`/api/storage/material/${material._id}/link`);
  const downloaded=await fetch(url);assert.equal(downloaded.status,200);assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),data);
  const ranged=await fetch(url,{headers:{Range:'bytes=0-7'}});assert.equal(ranged.status,206);assert.equal(await ranged.text(),'%PDF-1.7');
  const anonymous=await fetch(api+`/api/storage/material/${material._id}/link`);assert.equal(anonymous.status,401);
  const bad=await fetch(gateway+'?download=invalid');assert.equal(bad.status,400);
  console.log('PASS: API registration, idempotent finish, authorized download, HTTP Range, anonymous denial');
} finally {
  if(material) await request(`/api/admin/materials/${material._id}`,'DELETE');
  else if(created) await storage('delete',signServiceTicket({op:'delete',uploadId},config.secret));
  if(lesson) await request(`/api/admin/lessons/${lesson._id}`,'DELETE');
  if(mod) await request(`/api/admin/modules/${mod._id}`,'DELETE');
  console.log('Temporary module, class and file removed');
}
