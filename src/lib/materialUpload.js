import { apiFetch } from './api';
const sessions = new WeakMap();
async function json(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo conectar con el almacenamiento. Reintentá Guardar.');
  return data.data;
}
export async function uploadMaterial(file, form, token, onProgress, signal) {
  let session = sessions.get(file);
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };
  if (!session || session.lessonId !== form.lessonId || session.expires <= Date.now()) {
    session = await json(await apiFetch('/api/storage/init', {method:'POST',headers,body:JSON.stringify({name:file.name,size:file.size,lessonId:form.lessonId}),signal}));
    session.lessonId = form.lessonId;
    session.expires = Date.now() + 3500_000;
    sessions.set(file, session);
  }
  await json(await fetch(`${session.url}?action=create`,{method:'POST',headers:{Authorization:`Bearer ${session.ticket}`},signal}));
  for (let offset=0,index=0;offset<file.size;offset+=session.chunkBytes,index++) {
    const chunk=file.slice(offset,offset+session.chunkBytes);
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await chunk.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');
    for (let attempt=0;;attempt++) {
      try {
        await json(await fetch(`${session.url}?action=chunk`,{method:'POST',headers:{Authorization:`Bearer ${session.ticket}`,'Content-Type':'application/octet-stream','X-Chunk-Index':String(index),'X-Chunk-SHA256':hash},body:chunk,signal}));
        break;
      } catch(error) {
        if (signal?.aborted || attempt>=2) throw error;
        await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));
      }
    }
    onProgress(Math.round(Math.min(file.size,offset+chunk.size)/file.size*100));
  }
  const result=await json(await apiFetch('/api/storage/finish',{method:'POST',headers,body:JSON.stringify({...form,ticket:session.ticket}),signal}));
  sessions.delete(file);
  return result;
}
export async function cancelMaterialUpload(file) {
  const session=file && sessions.get(file);
  if (!session) return;
  await json(await fetch(`${session.url}?action=cancel`,{method:'POST',headers:{Authorization:`Bearer ${session.ticket}`}}));
  sessions.delete(file);
}
