import mongoose from 'mongoose';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import User from '../models/User.js';
import Material from '../models/Material.js';
import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';
import StudentProgress from '../models/StudentProgress.js';
import FinalAuthorization from '../models/FinalAuthorization.js';
import { evaluateCurriculum, idOf } from './curriculumRules.js';

export async function getCurriculum(studentId, moduleId) {
  const modules = await Module.find({ status: 'ACTIVE', ...(moduleId ? { _id: moduleId } : {}) }).lean();
  const lessons = await Lesson.find({ status: 'ACTIVE', moduleId: { $in: modules.map(m => m._id) } }).lean();
  const lessonIds = lessons.map(l => l._id);
  const [materials, exams, progress] = await Promise.all([
    Material.find({ lessonId: { $in: lessonIds } }).select('_id lessonId required').lean(),
    Exam.find({ $or: [{ lessonId: { $in: lessonIds } }, { moduleId: { $in: modules.map(m => m._id) } }] }).lean(),
    StudentProgress.find({ studentId, lessonId: { $in: lessonIds } }).lean(),
  ]);
  const attempts = await ExamAttempt.find({ studentId, examId: { $in: exams.map(e => e._id) } }).select('examId passed').lean();
  const curriculum = evaluateCurriculum({ modules, lessons, materials, exams, progress, attempts });
  const grants = await FinalAuthorization.find({ studentId, examId: { $in: exams.filter(e => e.moduleId).map(e => e._id) } }).lean();
  for (const module of curriculum) {
    if (!module.finalExam) continue;
    const grant = grants.find(g => idOf(g.examId) === idOf(module.finalExam));
    module.finalExam.authorization = {
      status: grant?.status || 'NONE',
      attemptsRemaining: grant?.status === 'APPROVED' ? Math.max(0, grant.attemptLimit - grant.attemptsUsed) : 0,
      attemptLimit: grant?.attemptLimit || 0,
    };
  }
  return curriculum;
}

async function activeStudent(studentId) {
  if (!mongoose.isValidObjectId(studentId)) return false;
  const user = await User.findById(studentId).select('status role mustChangePassword').lean();
  return !!user && user.status === 'ACTIVE' && ['STUDENT', 'ADMIN'].includes(user.role) && !user.mustChangePassword;
}

export async function canAccessLesson(studentId, lessonId) {
  if (!await activeStudent(studentId)) return { allowed: false, reason: 'Cuenta no autorizada o cambio de contraseña pendiente' };
  if (!mongoose.isValidObjectId(lessonId)) return { allowed: false, reason: 'Clase inválida' };
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson || lesson.status !== 'ACTIVE') return { allowed: false, reason: 'Clase no encontrada o inactiva' };
  const [module] = await getCurriculum(studentId, lesson.moduleId);
  if (!module) return { allowed: false, reason: 'Módulo no disponible' };
  const row = module.lessons.find(l => idOf(l) === idOf(lesson));
  if (!row || row.status === 'LOCKED') return { allowed: false, reason: 'Completá los materiales y aprobá los exámenes de las clases anteriores de este módulo.' };
  return { allowed: true, lesson, progress: row.progress };
}

export async function canAccessExam(studentId, exam) {
  if (!exam || exam.status !== 'ACTIVE') return { allowed: false, reason: 'Examen no disponible' };
  if (!exam.moduleId) {
    const access = await canAccessLesson(studentId, exam.lessonId);
    if (!access.allowed) return access;
    const materials = await Material.find({ lessonId: exam.lessonId }).select('_id').lean();
    const viewed = new Set((access.progress.materialsViewed || []).map(idOf));
    if (!materials.every(material => viewed.has(idOf(material)))) {
      return { allowed: false, reason: 'Marcá como visto todo el material de la clase antes de rendir el examen.' };
    }
    return access;
  }
  if (exam.lessonId || !await activeStudent(studentId)) return { allowed: false, reason: 'Acceso denegado' };
  const [module] = await getCurriculum(studentId, exam.moduleId);
  const final = module?.finalExam;
  if (!final || idOf(final) !== idOf(exam) || final.status === 'LOCKED') return { allowed: false, reason: 'Completá todas las clases de este módulo para realizar su examen final.' };
  const authorization = final.authorization;
  return final.status === 'COMPLETED' || (authorization.status === 'APPROVED' && authorization.attemptsRemaining > 0)
    ? { allowed: true, authorization, alreadyPassed: final.status === 'COMPLETED' }
    : { allowed: false, reason: 'Solicitá autorización al administrador para rendir este examen final.' };
}

export async function updateLessonCompletionStatus(studentId, lessonId) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new Error('Clase no encontrada');
  const [module] = await getCurriculum(studentId, lesson.moduleId);
  const row = module?.lessons.find(l => idOf(l) === idOf(lesson));
  const progress = await StudentProgress.findOne({ studentId, lessonId }) || new StudentProgress({ studentId, lessonId });
  progress.examPassed = !!row?.progress.examPassed;
  progress.isCompleted = row?.status === 'COMPLETED';
  progress.completedAt = progress.isCompleted ? (progress.completedAt || new Date()) : null;
  progress.lastAccessedAt = new Date();
  await progress.save();
  return progress;
}
