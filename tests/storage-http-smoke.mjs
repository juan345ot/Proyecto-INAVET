// Real HTTP upload fixture; no course material or student records are created.
import { readFileSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { signUploadTicket, signServiceTicket, CHUNK_BYTES } from '../server/storage/uploadProtocol.js';
const config=JSON.parse(readFileSync(new URL('../.env.storage.local',import.meta.url),'utf8'));
const url='https://inavet.com.ar/material-storage.php';
const bytes=Number(process.argv[2]||10_000_000);
const id=randomBytes(16).toString('hex');
const ticket=signUploadTicket({uploadId:id,adminId:'a'.repeat(24),lessonId:'b'.repeat(24),name:'inavet-prueba-temporal.pdf',size:bytes},config.secret);
async function call(action,token,body,extra={}) {
  const res=await fetch(`${url}?action=${action}`,{method:'POST',headers:{'X-Storage-Token':token,...extra},body,signal:AbortSignal.timeout(90000)});
  const raw=await res.text(); let json;try{json=JSON.parse(raw);}catch{throw Error(`HTTP ${res.status}: ${raw.slice(0,120)}`);}
  if(!res.ok||!json.success) throw Error(`${res.status}: ${json.message}`);
  return json.data;
}
let created=false;
try {
  const anon=await fetch(url,{method:'POST'}); assert.equal(anon.status,400);
  await call('create',ticket);created=true;
  const totalHash=createHash('sha256');
  for(let offset=0,index=0;offset<bytes;offset+=CHUNK_BYTES,index++) {
    const chunk=Buffer.alloc(Math.min(CHUNK_BYTES,bytes-offset),32);
    if(index===0) chunk.write('%PDF-1.7\n% INAVET TEMPORARY TEST\n');
    if(offset+chunk.length===bytes) chunk.write('\n%%EOF\n',chunk.length-7);
    totalHash.update(chunk);
    const headers={'Content-Type':'application/octet-stream','X-Chunk-Index':String(index),'X-Chunk-SHA256':createHash('sha256').update(chunk).digest('hex')};
    await call('chunk',ticket,chunk,headers);
    if(index===0) await call('chunk',ticket,chunk,headers); // Explicit retry test.
    if(index%10===0) console.log(`Uploaded ${offset+chunk.length}/${bytes}`);
  }
  const sealed=await call('seal',signServiceTicket({op:'seal',uploadId:id},config.secret));
  assert.equal(sealed.size,bytes);assert.equal(sealed.sha256,totalHash.digest('hex'));assert.equal(sealed.mime,'application/pdf');
  console.log(`PASS: ${bytes} bytes over HTTPS, idempotent retry and SHA256 match`);
} finally {
  if(created) {await call('delete',signServiceTicket({op:'delete',uploadId:id},config.secret));console.log('Temporary test upload removed');}
}
