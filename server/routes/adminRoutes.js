import express from 'express';
import bcrypt from 'bcryptjs';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Material from '../models/Material.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import ExamAttempt from '../models/ExamAttempt.js';
import StudentProgress from '../models/StudentProgress.js';

const router = express.Router();

// Aplica protección de admin estricta
router.use(protect);
router.use(requireRole('ADMIN'));

// ----------------- DASHBOARD ADMIN -----------------
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const activeStudents = await User.countDocuments({ role: 'STUDENT', status: 'ACTIVE' });
    const inactiveStudents = await User.countDocuments({ role: 'STUDENT', status: 'INACTIVE' });
    const totalLessons = await Lesson.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalAttempts = await ExamAttempt.countDocuments();

    // Actividad reciente
    const recentStudents = await User.find({ role: 'STUDENT' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAttempts = await ExamAttempt.find()
      .populate('studentId', 'firstName lastName username')
      .populate('examId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalLessons,
        totalExams,
        totalAttempts,
        recentStudents,
        recentAttempts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- GESTIÓN DE ALUMNOS -----------------
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'STUDENT' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { firstName, lastName, dni, email, phone, username, password, status } = req.body;

    if (!firstName || !lastName || !dni || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor complete todos los campos obligatorios',
      });
    }

    // Verificar si ya existe DNI, email o username
    const existing = await User.findOne({
      $or: [{ dni: dni.trim() }, { email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un alumno con ese DNI, Email o Nombre de usuario',
      });
    }

    const student = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dni: dni.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      username: username.toLowerCase().trim(),
      passwordHash: password, // Mongoose hook la hashea
      role: 'STUDENT',
      status: status || 'ACTIVE',
      mustChangePassword: true, // Siempre true para obligar al primer ingreso
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Alumno creado correctamente con contraseña temporal',
      data: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        dni: student.dni,
        email: student.email,
        username: student.username,
        status: student.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const { firstName, lastName, dni, email, phone, username, status } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }

    if (firstName) student.firstName = firstName.trim();
    if (lastName) student.lastName = lastName.trim();
    if (dni) student.dni = dni.trim();
    if (email) student.email = email.toLowerCase().trim();
    if (phone !== undefined) student.phone = phone.trim();
    if (username) student.username = username.toLowerCase().trim();
    if (status) student.status = status;

    await student.save();

    res.json({ success: true, message: 'Datos del alumno actualizados', data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset de contraseña por el administrador (fuerza cambio de nuevo)
router.post('/students/:id/reset-password', async (req, res) => {
  try {
    const { tempPassword } = req.body;
    if (!tempPassword || tempPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña temporal debe tener al menos 6 caracteres',
      });
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }

    student.passwordHash = tempPassword;
    student.mustChangePassword = true;
    await student.save();

    res.json({
      success: true,
      message: 'Contraseña reseteada con éxito. Se solicitará el cambio en su próximo ingreso.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Desactivación lógica
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }

    student.status = 'INACTIVE';
    await student.save();

    res.json({ success: true, message: 'Alumno desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- GESTIÓN DE MÓDULOS -----------------
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/modules', async (req, res) => {
  try {
    const { title, description, order, status } = req.body;
    const module = await Module.create({
      title,
      description,
      order: order || 1,
      status: status || 'ACTIVE',
    });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/modules/:id', async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    await Module.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' });
    res.json({ success: true, message: 'Módulo desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- GESTIÓN DE CLASES -----------------
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find().populate('moduleId', 'title').sort({ order: 1 });
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/lessons', async (req, res) => {
  try {
    const { moduleId, title, description, order, videoUrl, status } = req.body;
    const lesson = await Lesson.create({
      moduleId,
      title,
      description,
      order: order || 1,
      videoUrl: videoUrl || '',
      status: status || 'ACTIVE',
    });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- GESTIÓN DE MATERIALES -----------------
router.get('/lessons/:lessonId/materials', async (req, res) => {
  try {
    const materials = await Material.find({ lessonId: req.params.lessonId }).sort({ order: 1 });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/materials', async (req, res) => {
  try {
    const { lessonId, title, type, url, content, order } = req.body;
    const material = await Material.create({
      lessonId,
      title,
      type,
      url,
      content,
      order: order || 1,
    });
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/materials/:id', async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Material eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- GESTIÓN DE EXÁMENES Y PREGUNTAS -----------------
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find().populate('lessonId', 'title order').sort({ createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/exams', async (req, res) => {
  try {
    const { lessonId, title, description, passingScorePercent } = req.body;
    const exam = await Exam.create({
      lessonId,
      title,
      description,
      passingScorePercent: passingScorePercent || 70,
    });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/exams/:examId/questions', async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId }).sort({ order: 1 });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { examId, prompt, options, correctOptionIndex, order } = req.body;
    const question = await Question.create({
      examId,
      prompt,
      options,
      correctOptionIndex,
      order: order || 1,
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pregunta eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
