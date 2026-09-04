import Lesson from '../models/Lesson.js';
import Material from '../models/Material.js';
import StudentProgress from '../models/StudentProgress.js';

/**
 * Verifica si un alumno tiene autorización para acceder a una clase determinada.
 * Regla de negocio INAVET:
 * - Si es la primera clase activa (menor orden), tiene acceso automático.
 * - Si es una clase posterior, debe haber completado la clase previa activa
 *   (todos los materiales vistos + examen aprobado).
 */
export const canAccessLesson = async (studentId, lessonId) => {
  const targetLesson = await Lesson.findById(lessonId);
  if (!targetLesson || targetLesson.status !== 'ACTIVE') {
    return { allowed: false, reason: 'Clase no encontrada o inactiva' };
  }

  // Obtenemos todas las clases activas ordenadas ascendentemente
  const activeLessons = await Lesson.find({ status: 'ACTIVE' }).sort({ order: 1, createdAt: 1 });

  const targetIndex = activeLessons.findIndex(
    (l) => l._id.toString() === targetLesson._id.toString()
  );

  if (targetIndex === -1) {
    return { allowed: false, reason: 'La clase no pertenece al plan activo' };
  }

  // Primera clase: siempre accesible para alumnos activos
  if (targetIndex === 0) {
    return { allowed: true, lesson: targetLesson };
  }

  // Revisar que la clase anterior inmediata esté completada
  const previousLesson = activeLessons[targetIndex - 1];
  const prevProgress = await StudentProgress.findOne({
    studentId,
    lessonId: previousLesson._id,
  });

  if (!prevProgress || !prevProgress.isCompleted) {
    return {
      allowed: false,
      reason: `Esta clase todavía está bloqueada. Completá y aprobá la clase anterior ("${previousLesson.title}") para continuar.`,
      previousLessonId: previousLesson._id,
    };
  }

  return { allowed: true, lesson: targetLesson };
};

/**
 * Evalúa y actualiza si una clase pasa al estado COMPLETED para un alumno:
 * Requiere:
 * 1. Todos los materiales de la clase marcados como vistos
 * 2. Examen de la clase aprobado (si la clase cuenta con examen)
 */
export const updateLessonCompletionStatus = async (studentId, lessonId) => {
  const totalMaterialsCount = await Material.countDocuments({ lessonId });
  let progress = await StudentProgress.findOne({ studentId, lessonId });

  if (!progress) {
    progress = new StudentProgress({
      studentId,
      lessonId,
      materialsViewed: [],
      examPassed: false,
      isCompleted: false,
    });
  }

  const viewedCount = progress.materialsViewed ? progress.materialsViewed.length : 0;
  const materialsDone = totalMaterialsCount === 0 || viewedCount >= totalMaterialsCount;
  const examDone = progress.examPassed;

  if (materialsDone && examDone) {
    if (!progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
  } else {
    progress.isCompleted = false;
  }

  progress.lastAccessedAt = new Date();
  await progress.save();
  return progress;
};
