import express from 'express';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Material from '../models/Material.js';
import { canAccessLesson } from '../services/progressService.js';
import { signUploadTicket, verifyUploadTicket, signServiceTicket, verifyServiceTicket, validateUpload, MAX_FILE_BYTES, CHUNK_BYTES } from '../storage/uploadProtocol.js';

const router = express.Router();
const secret = () => process.env.STORAGE_SECRET;
const endpoint = () => process.env.STORAGE_URL;
const enabled = () => process.env.STORAGE_ENABLED === 'true' && secret() && endpoint();

async function callStorage(op, uploadId) {
  const token = signServiceTicket({op, uploadId}, secret());
  const res = await fetch(`${endpoint()}?action=${op}`, {method:'POST', headers:{'X-Storage-Token':token}, signal:AbortSignal.timeout(120000)});
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Almacenamiento no disponible');
  return data.data;
}

async function allowedDownload(user, material) {
  if (!user || user.status !== 'ACTIVE' || !material?.storageKey) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role !== 'STUDENT' || user.mustChangePassword) return false;
  const lesson = await Lesson.findById(material.lessonId);
  if (!lesson || !await Module.exists({_id:lesson.moduleId,status:'ACTIVE'})) return false;
  return (await canAccessLesson(user._id, material.lessonId)).allowed;
}

// DreamHost revalidates access for every download/range request, not just when issuing a link.
router.post('/authorize', async (req,res) => {
  try {
    const claims=verifyServiceTicket(req.body.token,secret());
    if(claims.op!=='download' || !mongoose.isValidObjectId(claims.userId) || !mongoose.isValidObjectId(claims.materialId)) throw new Error();
    const [user,material]=await Promise.all([User.findById(claims.userId),Material.findById(claims.materialId)]);
    if(material?.storageKey!==claims.uploadId || !await allowedDownload(user,material)) throw new Error();
    res.json({success:true});
  } catch { res.status(403).json({success:false,message:'Acceso denegado'}); }
});

router.use(protect);
router.get('/config',requireRole('ADMIN'),(req,res)=>res.json({success:true,data:{enabled:!!enabled(),maxBytes:enabled()?MAX_FILE_BYTES:20*1024*1024,chunkBytes:CHUNK_BYTES}}));

router.post('/init',requireRole('ADMIN'),async(req,res)=>{
  try {
    if(!enabled()) return res.status(503).json({success:false,message:'Las subidas grandes todavía no están habilitadas.'});
    const spec=validateUpload(req.body);
    if(!mongoose.isValidObjectId(req.body.lessonId) || !await Lesson.exists({_id:req.body.lessonId})) return res.status(400).json({success:false,message:'Clase inválida'});
    const uploadId=randomBytes(16).toString('hex');
    const ticket=signUploadTicket({...spec,uploadId,adminId:String(req.user._id),lessonId:req.body.lessonId},secret());
    res.json({success:true,data:{ticket,uploadId,url:endpoint(),chunkBytes:CHUNK_BYTES}});
  }catch {res.status(400).json({success:false,message:'Archivo inválido. Máximo: 500 MB.'});}
});

router.post('/finish',requireRole('ADMIN'),async(req,res)=>{
  try {
    const claims=verifyUploadTicket(req.body.ticket,secret());
    if(claims.adminId!==String(req.user._id)) return res.status(403).json({success:false,message:'Subida ajena'});
    if(!await Lesson.exists({_id:claims.lessonId})) return res.status(400).json({success:false,message:'La clase ya no existe'});
    const id=new mongoose.Types.ObjectId(claims.uploadId.slice(0,24));
    let material=await Material.findById(id);
    if(material && material.storageKey!==claims.uploadId) throw new Error('Conflicto de material');
    if(!material){
      const title=typeof req.body.title==='string'?req.body.title.trim():'';
      if(!title || title.length>240) return res.status(400).json({success:false,message:'Título inválido'});
      const file=await callStorage('seal',claims.uploadId);
      if(file.size!==claims.size) throw new Error('Tamaño de archivo incorrecto');
      const ext=claims.name.split('.').pop().toLowerCase();
      const type=ext==='pdf'?'PDF':ext.startsWith('ppt')?'PPT':ext.startsWith('doc')?'DOC':'IMAGE';
      try { material=await Material.create({_id:id,lessonId:claims.lessonId,title,type,content:typeof req.body.content==='string'?req.body.content.slice(0,50000):'',order:Number(req.body.order)||1,storageKey:claims.uploadId,fileName:claims.name,fileSize:claims.size,mimeType:file.mime,sha256:file.sha256}); }
      catch(e){ if(e.code!==11000) throw e; material=await Material.findById(id); if(material?.storageKey!==claims.uploadId) throw e; }
    }
    await callStorage('commit',claims.uploadId);
    res.json({success:true,data:material});
  }catch(e){console.error('[Storage] Finish failed:',e.name);res.status(400).json({success:false,message:'No se pudo finalizar. Reintentá Guardar con el mismo archivo.'});}
});

router.get('/material/:id/link',async(req,res)=>{
  try {
    const material=await Material.findById(req.params.id);
    if(!await allowedDownload(req.user,material)) return res.status(403).json({success:false,message:'No tenés acceso a este material'});
    const token=signServiceTicket({op:'download',uploadId:material.storageKey,userId:String(req.user._id),materialId:String(material._id)},secret());
    res.json({success:true,data:{url:`${endpoint()}?download=${encodeURIComponent(token)}`}});
  }catch {res.status(400).json({success:false,message:'No se pudo abrir el material'});}
});

export async function deleteStoredMaterial(material) {
  if(material.storageKey) await callStorage('delete',material.storageKey);
  else if(material.fileId) {
    const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{bucketName:'materials'});
    if(await mongoose.connection.db.collection('materials.files').findOne({_id:material.fileId})) await bucket.delete(material.fileId);
  }
}
export default router;
