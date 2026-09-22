import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import FinalAuthorization from '../models/FinalAuthorization.js';
import { getCurriculum } from '../services/progressService.js';
import { academicOrder, idOf } from '../services/curriculumRules.js';

export const studentFinalRoutes = express.Router();
export const adminFinalRoutes = express.Router();
const fail = (res, error) => res.status(error.code === 11000 ? 409 : 400).json({ success: false, message: error.code === 11000 ? 'La solicitud ya existe. Actualizá la página.' : error.message });

async function eligible(studentId, examId) {
  if (!mongoose.isValidObjectId(examId)) throw new Error('Examen inválido');
  const exam = await Exam.findById(examId);
  const user = await User.findById(studentId).select('role status mustChangePassword');
  if (!user || user.role !== 'STUDENT' || user.status !== 'ACTIVE' || user.mustChangePassword) throw new Error('Alumno no habilitado');
  if (!exam?.moduleId || exam.status !== 'ACTIVE') throw new Error('Examen final no disponible');
  const [module] = await getCurriculum(studentId, exam.moduleId);
  if (!module?.finalExam || String(module.finalExam._id) !== String(exam._id) || module.finalExam.status === 'LOCKED') throw new Error('Primero completá todas las clases y exámenes del módulo');
  if (module.finalExam.status === 'COMPLETED') throw new Error('Este examen final ya está aprobado');
  return exam;
}

studentFinalRoutes.post('/final-exams/:examId/request', async (req, res) => {
  try {
    await eligible(req.user._id, req.params.examId);
    const filter = { studentId: req.user._id, examId: req.params.examId };
    let grant = await FinalAuthorization.findOne(filter);
    if (!grant) grant = await FinalAuthorization.create({ ...filter, history: [{ action: 'REQUEST', at: new Date(), by: req.user._id, cycle: 0 }] });
    else if (['EXHAUSTED', 'REVOKED'].includes(grant.status)) {
      grant = await FinalAuthorization.findOneAndUpdate({ ...filter, status: grant.status }, { $set: { status: 'PENDING', requestedAt: new Date() }, $push: { history: { action: 'REQUEST', at: new Date(), by: req.user._id, cycle: grant.cycle } } }, { returnDocument: 'after' });
      if (!grant) throw new Error('La solicitud cambió; actualizá la página');
    }
    res.json({ success: true, data: { status: grant.status } });
  } catch (error) { fail(res, error); }
});

adminFinalRoutes.get('/final-authorizations', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    if (req.query.page !== undefined) {
      const page = Number(req.query.page);
      const pageSize = 5;
      if (!Number.isSafeInteger(page) || page < 1) throw new Error('Página inválida');
      const total = await FinalAuthorization.countDocuments();
      const pages = Math.max(1, Math.ceil(total / pageSize));
      const current = Math.min(page, pages);
      const rows = await FinalAuthorization.aggregate([
        { $addFields: { pendingPriority: { $cond: [{ $eq: ['$status', 'PENDING'] }, 0, 1] } } },
        { $sort: { pendingPriority: 1, requestedAt: -1, _id: -1 } },
        { $skip: (current - 1) * pageSize }, { $limit: pageSize },
        { $project: { pendingPriority: 0 } },
      ]);
      const data = await FinalAuthorization.populate(rows, [
        { path: 'studentId', select: 'firstName lastName username status' },
        { path: 'examId', select: 'title moduleId maxAttemptsPerAuthorization status', populate: { path: 'moduleId', select: 'title' } },
      ]);
      return res.json({ success: true, data, pagination: { page: current, pages, total, pageSize } });
    }
    const data = await FinalAuthorization.find().sort({ requestedAt: -1 }).limit(1000)
      .populate('studentId', 'firstName lastName username status')
      .populate({ path: 'examId', select: 'title moduleId maxAttemptsPerAuthorization status', populate: { path: 'moduleId', select: 'title' } });
    res.json({ success: true, data });
  } catch (error) { fail(res, error); }
});

adminFinalRoutes.post('/final-authorizations/:id/:action', async (req, res) => {
  try {
    const grant = await FinalAuthorization.findById(req.params.id);
    if (!grant) throw new Error('Solicitud inexistente');
    let update;
    if (req.params.action === 'approve') {
      if (grant.status !== 'PENDING') throw new Error('Solo se pueden aprobar solicitudes pendientes');
      const exam = await eligible(grant.studentId, grant.examId);
      const limit = exam.maxAttemptsPerAuthorization;
      update = { $set: { status: 'APPROVED', attemptsUsed: 0, attemptLimit: limit, authorizedBy: req.user._id, authorizedAt: new Date() }, $inc: { cycle: 1 }, $push: { history: { action: 'APPROVE', at: new Date(), by: req.user._id, cycle: grant.cycle + 1, limit } } };
    } else if (req.params.action === 'revoke') {
      if (!['APPROVED', 'PENDING'].includes(grant.status)) throw new Error('Esta autorización no puede revocarse');
      update = { $set: { status: 'REVOKED' }, $push: { history: { action: 'REVOKE', at: new Date(), by: req.user._id, cycle: grant.cycle } } };
    } else throw new Error('Acción inválida');
    const changed = await FinalAuthorization.findOneAndUpdate({ _id: grant._id, status: grant.status, cycle: grant.cycle }, update, { returnDocument: 'after' });
    if (!changed) throw new Error('La solicitud cambió; actualizá la página');
    res.json({ success: true, data: changed });
  } catch (error) { fail(res, error); }
});

async function questionBank(examId) {
  const final = await Exam.findById(examId);
  if (!final?.moduleId) throw new Error('Seleccioná un examen final vinculado a un módulo');
  const lessons = (await Lesson.find({ moduleId: final.moduleId }).select('_id title order createdAt').lean()).sort(academicOrder);
  const exams = await Exam.find({ lessonId: { $in: lessons.map(l => l._id) }, moduleId: null }).select('_id title lessonId');
  const questions = await Question.find({ examId: { $in: exams.map(e => e._id) } }).lean();
  return lessons.flatMap(lesson => {
    const exam = exams.find(e => idOf(e.lessonId) === idOf(lesson));
    return questions.filter(q => idOf(q.examId) === idOf(exam)).sort(academicOrder)
      .map(q => ({ ...q, sourceExamTitle: exam.title, sourceLessonTitle: lesson.title, sourceLessonId: lesson._id }));
  });
}
adminFinalRoutes.get('/exams/:examId/question-bank', async (req, res) => {
  try { res.json({ success: true, data: await questionBank(req.params.examId) }); }
  catch (error) { fail(res, error); }
});
adminFinalRoutes.post('/exams/:examId/copy-questions', async (req, res) => {
  try {
    const ids = req.body.questionIds;
    if (!Array.isArray(ids) || !ids.length || ids.length > 100 || ids.some(id => !mongoose.isValidObjectId(id))) throw new Error('Elegí entre 1 y 100 preguntas válidas');
    const bank = await questionBank(req.params.examId);
    const selectedIds = new Set(ids);
    const selected = bank.filter(q => selectedIds.has(String(q._id)));
    if (selected.length !== selectedIds.size) throw new Error('Solo podés copiar preguntas de clases de este mismo módulo');
    const last = await Question.findOne({ examId: req.params.examId }).sort({ order: -1 });
    const result = await Question.bulkWrite(selected.map((q, i) => ({ updateOne: {
      filter: { examId: new mongoose.Types.ObjectId(req.params.examId), sourceQuestionId: q._id },
      update: { $setOnInsert: { prompt: q.prompt, options: q.options, correctOptionIndex: q.correctOptionIndex, order: (last?.order || 0) + i + 1 } }, upsert: true,
    } })));
    res.json({ success: true, data: { copied: result.upsertedCount } });
  } catch (error) { fail(res, error); }
});
