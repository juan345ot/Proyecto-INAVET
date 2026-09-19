// Local, disposable MongoDB. Never loads production .env or connects to Atlas.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import User from '../server/models/User.js';
import Module from '../server/models/Module.js';
import Lesson from '../server/models/Lesson.js';
import Material from '../server/models/Material.js';
import Exam from '../server/models/Exam.js';
import Question from '../server/models/Question.js';
import ExamAttempt from '../server/models/ExamAttempt.js';
import StudentProgress from '../server/models/StudentProgress.js';
import studentRoutes from '../server/routes/studentRoutes.js';
import adminRoutes from '../server/routes/adminRoutes.js';
import authRoutes from '../server/routes/authRoutes.js';
process.env.JWT_SECRET=randomBytes(32).toString('hex');
process.env.STORAGE_ENABLED='false';delete process.env.STORAGE_SECRET;delete process.env.STORAGE_URL;
const mongo=await MongoMemoryServer.create({instance:{dbName:'inavet_local_test'}});let server;
try {
  await mongoose.connect(mongo.getUri(),{dbName:'inavet_local_test'});
  const makeUser=(username,role,status='ACTIVE')=>User.create({username,role,status,firstName:'Prueba',lastName:username,dni:username,email:username+'@example.invalid',passwordHash:'Local-test-only-2026!',mustChangePassword:false});
  const admin=await makeUser('admin_test','ADMIN'), student=await makeUser('student_test','STUDENT'), inactive=await makeUser('inactive_test','STUDENT','INACTIVE');
  const [a,b,h]=await Module.create([{title:'Anatomía',order:1},{title:'Primeros auxilios',order:2},{title:'Oculto',status:'INACTIVE'}]);
  const [a1,a2,b1,b2,h1]=await Lesson.create([{title:'Clase 1',moduleId:a._id,order:4},{title:'Sistema óseo',moduleId:a._id,order:8},{title:'Introducción',moduleId:b._id,order:10},{title:'Cuidados',moduleId:b._id,order:20},{title:'Oculta',moduleId:h._id}]);
  const materials=await Material.create([a1,a2,b1,b2].map(l=>({title:'Apunte '+l.title,lessonId:l._id,type:'TEXT',content:'Material ficticio'})));
  const exams=await Exam.create([a1,a2,b1,b2].map(l=>({title:'Examen '+l.title,lessonId:l._id})));
  const final=await Exam.create({title:'Validación final de Anatomía',moduleId:a._id,passingScorePercent:80});
  for(const ex of [...exams,final])await Question.create({examId:ex._id,prompt:'Elegí la correcta',options:['Correcta','Incorrecta'],correctOptionIndex:0});
  const app=express();app.use(express.json());app.use('/api/auth',authRoutes);app.use('/api/student',studentRoutes);app.use('/api/admin',adminRoutes);
  server=app.listen(process.env.QA_KEEP_OPEN==='true'?5000:0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  const base='http://127.0.0.1:'+server.address().port;
  async function req(path,method='GET',body,user=student,status=200){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(user?{Authorization:'Bearer '+jwt.sign({id:String(user._id)},process.env.JWT_SECRET)}:{})},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,status,`${path}: ${JSON.stringify(d)}`);return d.data;}
  const dashboard=()=>req('/api/student/dashboard');
  const submit=async(ex,correct=true,status=200)=>{const q=await Question.findOne({examId:ex._id});return req('/api/student/exam/'+ex._id+'/submit','POST',{answers:[{questionId:String(q._id),selectedOptionIndex:correct?0:1}]},student,status);};
  const mark=(l,m,status=200)=>req(`/api/student/lesson/${l._id}/material/${m._id}/toggle-view`,'POST',undefined,student,status);
  assert.equal((await dashboard()).modules.length,2);
  await req('/api/student/dashboard','GET',undefined,null,401);await req('/api/student/dashboard','GET',undefined,inactive,403);
  await req('/api/student/lesson/'+a1._id);await req('/api/student/lesson/'+b1._id);
  await req('/api/student/lesson/'+a2._id,'GET',undefined,student,403);await req('/api/student/lesson/'+h1._id,'GET',undefined,student,403);
  await req('/api/student/exam/'+exams[1]._id,'GET',undefined,student,403);await submit(exams[1],true,403);await submit(final,true,403);
  assert.equal(await ExamAttempt.countDocuments(),0);await mark(a1,materials[2],404);
  assert.equal((await submit(exams[0])).passed,true);await req('/api/student/lesson/'+a2._id,'GET',undefined,student,403);
  await mark(a1,materials[0]);await req('/api/student/lesson/'+a2._id);await req('/api/student/lesson/'+b2._id,'GET',undefined,student,403);
  await mark(a2,materials[1]);await submit(final,true,403);assert.equal((await submit(exams[1],false)).passed,false);await submit(final,true,403);await submit(exams[1]);
  assert.equal((await dashboard()).modules[0].finalExam.status,'AVAILABLE');await submit(final,false);await submit(final);
  assert.equal((await dashboard()).modules[0].status,'COMPLETED');assert.equal((await dashboard()).modules[1].lessons[1].status,'LOCKED');
  assert.equal(await ExamAttempt.countDocuments({examId:final._id}),2);assert.equal(await StudentProgress.countDocuments({lessonId:null}),0);
  await req('/api/admin/exams/'+final._id+'/attempts','GET',undefined,student,403);
  assert.equal((await req('/api/admin/exams/'+final._id+'/attempts','GET',undefined,admin)).length,2);
  await req('/api/admin/exams/'+final._id,'PUT',{status:'INACTIVE'},admin);await req('/api/student/exam/'+final._id,'GET',undefined,student,404);
  assert.equal((await Exam.findById(final._id)).title,final.title);await req('/api/admin/exams/'+final._id,'PUT',{status:'ACTIVE'},admin);
  await req('/api/admin/exams','POST',{title:'Duplicado',moduleId:a._id},admin,400);
  await req('/api/admin/exams','POST',{title:'Ambiguo',moduleId:b._id,lessonId:b1._id},admin,400);
  await req('/api/admin/lessons/'+a2._id,'PUT',{order:1},admin);await mark(a2,materials[1]);await req('/api/student/lesson/'+a1._id,'GET',undefined,student,403);await submit(final,true,403);
  await req('/api/admin/modules/'+b._id,'PUT',{status:'INACTIVE'},admin);await req('/api/student/lesson/'+b1._id,'GET',undefined,student,403);
  await User.updateOne({_id:student._id},{$set:{status:'INACTIVE'}});await req('/api/student/dashboard','GET',undefined,student,403);
  console.log('PASS: real HTTP/MongoDB tests: module independence, materials, GET/POST exam guards, final evaluation, retries, history, admin controls, reordering, inactive accounts/modules.');
  if(process.env.QA_KEEP_OPEN==='true'){
    await User.updateOne({_id:student._id},{$set:{status:'ACTIVE'}});await Module.updateOne({_id:b._id},{$set:{status:'ACTIVE'}});
    console.log('Browser fixtures ready at '+base+'; admin_test / student_test, password Local-test-only-2026!');
    await new Promise(resolve=>{process.once('SIGINT',resolve);process.once('SIGTERM',resolve);});
  }
}finally{if(server)await new Promise(r=>server.close(r));await mongoose.disconnect();await mongo.stop();}
