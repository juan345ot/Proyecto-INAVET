import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Material from '../models/Material.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import StudentProgress from '../models/StudentProgress.js';
import ExamAttempt from '../models/ExamAttempt.js';
import { canAccessLesson, updateLessonCompletionStatus } from '../services/progressService.js';

const router = express.Router();

// Aplica middleware a todas las rutas de alumno
router.use(protect);
router.use(requireRole('STUDENT', 'ADMIN'));

// @route   GET /api/student/dashboard
// @desc    Obtiene visión general del curso para el alumno: módulos, progreso, continuar donde lo dejaste
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Obtener módulos activos ordenados
    const modules = await Module.find({ status: 'ACTIVE' }).sort({ order: 1 });

    // 2. Obtener clases activas ordenadas
    const lessons = await Lesson.find({ status: 'ACTIVE' }).sort({ order: 1 });

    // 3. Obtener progreso del alumno
    const progressList = await StudentProgress.find({ studentId });
    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.lessonId.toString()] = p;
    });

    // 4. Determinar estado de cada clase y módulo
    let completedLessonsCount = 0;
    let lastVisitedLesson = null;
    let nextAvailableLesson = null;

    const lessonsWithStatus = [];
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const prog = progressMap[lesson._id.toString()];

      let status = 'LOCKED';
      if (prog && prog.isCompleted) {
        status = 'COMPLETED';
        completedLessonsCount++;
      } else if (i === 0) {
        status = 'AVAILABLE';
      } else {
        const prevLesson = lessons[i - 1];
        const prevProg = progressMap[prevLesson._id.toString()];
        if (prevProg && prevProg.isCompleted) {
          status = 'AVAILABLE';
        } else {
          status = 'LOCKED';
        }
      }

      if (prog && prog.materialsViewed && prog.materialsViewed.length > 0 && status !== 'COMPLETED') {
        status = 'IN_PROGRESS';
      }

      // Detectar la próxima disponible o última visitada
      if (status !== 'LOCKED' && !nextAvailableLesson && status !== 'COMPLETED') {
        nextAvailableLesson = lesson;
      }

      lessonsWithStatus.push({
        _id: lesson._id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        status,
        progress: prog || null,
      });
    }

    // Calcular última clase accedida si existe en StudentProgress
    const recentProgress = await StudentProgress.findOne({ studentId })
      .sort({ lastAccessedAt: -1 })
      .populate('lessonId');

    if (recentProgress && recentProgress.lessonId) {
      lastVisitedLesson = recentProgress.lessonId;
    }

    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
    const isCourseFinished = totalLessons > 0 && completedLessonsCount === totalLessons;

    // Estructurar módulos con sus clases
    const modulesStructured = modules.map((m) => {
      const moduleLessons = lessonsWithStatus.filter(
        (l) => l.moduleId.toString() === m._id.toString()
      );
      const isCompleted = moduleLessons.length > 0 && moduleLessons.every((l) => l.status === 'COMPLETED');
      const isLocked = moduleLessons.length > 0 && moduleLessons.every((l) => l.status === 'LOCKED');
      
      return {
        _id: m._id,
        title: m.title,
        description: m.description,
        order: m.order,
        status: isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'IN_PROGRESS',
        lessons: moduleLessons,
      };
    });

    res.json({
      success: true,
      data: {
        welcomeName: req.user.firstName,
        totalLessons,
        completedLessonsCount,
        progressPercentage,
        isCourseFinished,
        continueWhereLeft: lastVisitedLesson || nextAvailableLesson || (lessons[0] || null),
        modules: modulesStructured,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/lesson/:id
// @desc    Obtener contenido de una clase con validación backend de correlatividad
router.get('/lesson/:id', async (req, res) => {
  try {
    const studentId = req.user._id;
    const lessonId = req.params.id;

    // Validación estricta en servidor
    const access = await canAccessLesson(studentId, lessonId);
    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.reason,
      });
    }

    const lesson = access.lesson;
    const materials = await Material.find({ lessonId }).sort({ order: 1 });
    const exam = await Exam.findOne({ lessonId, status: 'ACTIVE' }).select('-__v');
    const progress = await StudentProgress.findOne({ studentId, lessonId });

    // Actualizar fecha de último acceso
    if (progress) {
      progress.lastAccessedAt = new Date();
      await progress.save();
    } else {
      await StudentProgress.create({
        studentId,
        lessonId,
        materialsViewed: [],
        lastAccessedAt: new Date(),
      });
    }

    res.json({
      success: true,
      data: {
        lesson,
        materials,
        examAvailable: !!exam,
        examId: exam ? exam._id : null,
        progress: progress || { materialsViewed: [], examPassed: false, isCompleted: false },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/student/lesson/:lessonId/material/:materialId/toggle-view
// @desc    Marcar / desmarcar material como visto
router.post('/lesson/:lessonId/material/:materialId/toggle-view', async (req, res) => {
  try {
    const studentId = req.user._id;
    const { lessonId, materialId } = req.params;

    // Validación de acceso a la clase
    const access = await canAccessLesson(studentId, lessonId);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: access.reason });
    }

    let progress = await StudentProgress.findOne({ studentId, lessonId });
    if (!progress) {
      progress = new StudentProgress({
        studentId,
        lessonId,
        materialsViewed: [],
      });
    }

    const viewedIndex = progress.materialsViewed.indexOf(materialId);
    if (viewedIndex > -1) {
      progress.materialsViewed.splice(viewedIndex, 1);
    } else {
      progress.materialsViewed.push(materialId);
    }

    await progress.save();
    // Evaluar si la clase queda completa
    const updated = await updateLessonCompletionStatus(studentId, lessonId);

    res.json({
      success: true,
      data: {
        materialsViewed: updated.materialsViewed,
        isCompleted: updated.isCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/exam/:examId
// @desc    Obtener preguntas del examen (SIN incluir la respuesta correcta para seguridad)
router.get('/exam/:examId', async (req, res) => {
  try {
    const studentId = req.user._id;
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Examen no disponible' });
    }

    // Verificar permiso a la clase dueña del examen
    const access = await canAccessLesson(studentId, exam.lessonId);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: access.reason });
    }

    // Omitimos correctOptionIndex para que no se filtre en la petición de red
    const questions = await Question.find({ examId: exam._id })
      .select('-correctOptionIndex')
      .sort({ order: 1 });

    const attemptsCount = await ExamAttempt.countDocuments({ studentId, examId: exam._id });
    const lastAttempt = await ExamAttempt.findOne({ studentId, examId: exam._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        exam: {
          _id: exam._id,
          title: exam.title,
          description: exam.description,
          passingScorePercent: exam.passingScorePercent,
        },
        questions,
        attemptsCount,
        lastAttempt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/student/exam/:examId/submit
// @desc    Envío de respuestas, corrección automática en servidor y desbloqueo de avance
router.post('/exam/:examId/submit', async (req, res) => {
  try {
    const studentId = req.user._id;
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Examen no disponible' });
    }

    const { answers } = req.body; // Array de { questionId, selectedOptionIndex }
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Formato de respuestas inválido' });
    }

    // Obtener preguntas reales con su índice correcto
    const actualQuestions = await Question.find({ examId: exam._id });
    const questionMap = {};
    actualQuestions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    let correctCount = 0;
    const gradedAnswers = [];

    actualQuestions.forEach((q) => {
      const submitted = answers.find((a) => a.questionId === q._id.toString());
      const selectedIndex = submitted !== undefined ? submitted.selectedOptionIndex : null;
      const isCorrect = selectedIndex !== null && selectedIndex === q.correctOptionIndex;

      if (isCorrect) correctCount++;

      gradedAnswers.push({
        questionId: q._id,
        selectedOptionIndex: selectedIndex,
        isCorrect,
      });
    });

    const totalQuestions = actualQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= exam.passingScorePercent;

    const previousAttempts = await ExamAttempt.countDocuments({ studentId, examId: exam._id });

    // Guardar intento en historial
    const attempt = await ExamAttempt.create({
      studentId,
      examId: exam._id,
      attemptNumber: previousAttempts + 1,
      totalQuestions,
      correctCount,
      percentage,
      passed,
      answers: gradedAnswers,
    });

    // Si aprobó, actualizar StudentProgress de la clase
    if (passed) {
      let progress = await StudentProgress.findOne({ studentId, lessonId: exam.lessonId });
      if (!progress) {
        progress = new StudentProgress({
          studentId,
          lessonId: exam.lessonId,
          materialsViewed: [],
        });
      }
      progress.examPassed = true;
      await progress.save();
      await updateLessonCompletionStatus(studentId, exam.lessonId);
    }

    res.json({
      success: true,
      data: {
        score: correctCount,
        totalQuestions,
        percentage,
        passingScorePercent: exam.passingScorePercent,
        passed,
        attemptNumber: attempt.attemptNumber,
        message: passed
          ? '¡Felicitaciones! Has aprobado el examen.'
          : 'No alcanzaste el puntaje mínimo requerido. Podés intentarlo nuevamente.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
