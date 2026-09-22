import { deleteStoredMaterial } from './storageRoutes.js';
import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Material from '../models/Material.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import ExamAttempt from '../models/ExamAttempt.js';
import StudentProgress from '../models/StudentProgress.js';
import FinalAuthorization from '../models/FinalAuthorization.js';
import { adminFinalRoutes } from './finalExamRoutes.js';

const router = express.Router();

// Aplica protección de admin estricta
router.use(protect);
router.use(requireRole('ADMIN'));
router.use(adminFinalRoutes);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const allowedExtensions = new Set(['pdf', 'ppt', 'pptx', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'gif']);
const fileExtension = (name = '') => name.split('.').pop().toLowerCase();

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

// Eliminación definitiva de un alumno y sus datos académicos.
router.delete('/students/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Identificador de alumno inválido' });
  }
  const session = await mongoose.startSession();
  try {
    let deleted = false;
    await session.withTransaction(async () => {
      const student = await User.findOne({ _id: req.params.id, role: 'STUDENT' }).session(session);
      if (!student) return;
      await StudentProgress.deleteMany({ studentId: student._id }).session(session);
      await ExamAttempt.deleteMany({ studentId: student._id }).session(session);
      await User.deleteOne({ _id: student._id, role: 'STUDENT' }).session(session);
      deleted = true;
    });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }
    res.json({ success: true, message: 'Alumno eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar alumno:', error);
    res.status(500).json({ success: false, message: 'No se pudo eliminar al alumno. Intentá nuevamente.' });
  } finally {
    await session.endSession();
  }
});

// Endpoint consolidado del plan de estudios (módulos con sus clases, materiales y examen)
router.get('/curriculum-tree', async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    const lessons = await Lesson.find().sort({ order: 1, createdAt: 1, _id: 1 });
    const materials = await Material.find().sort({ order: 1 });
    const exams = await Exam.find().sort({ title: 1 });

    const tree = modules.map((m) => {
      const moduleLessons = lessons
        .filter((l) => l.moduleId.toString() === m._id.toString())
        .map((l) => {
          const lessonMaterials = materials.filter((mat) => mat.lessonId.toString() === l._id.toString());
          const lessonExam = exams.find((ex) => ex.lessonId && ex.lessonId.toString() === l._id.toString());
          return {
            ...l.toObject(),
            materials: lessonMaterials,
            exam: lessonExam || null,
          };
        });

      return {
        ...m.toObject(),
        lessons: moduleLessons,
        finalExam: exams.find(ex => ex.moduleId && String(ex.moduleId) === String(m._id)) || null,
      };
    });

    res.json({ success: true, data: tree });
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
      order: order ?? 1,
      status: status || 'ACTIVE',
    });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/modules/:id', async (req, res) => {
  try {
    const fields = Object.fromEntries(['title', 'description', 'order', 'status'].filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]));
    const module = await Module.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/modules/:id', async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Módulo eliminado correctamente' });
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
    if (!await Module.exists({ _id: moduleId })) return res.status(400).json({ success: false, message: 'Módulo inexistente' });
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
    const fields = Object.fromEntries(['title', 'description', 'order', 'videoUrl', 'status'].filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]));
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    // Eliminar también materiales vinculados
    await Material.deleteMany({ lessonId: req.params.id });
    res.json({ success: true, message: 'Clase eliminada correctamente' });
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

// Carga de archivo desde el formulario "Agregar Material a la Clase".
// Los archivos se almacenan en GridFS de MongoDB Atlas, no en el disco efímero de Render.
router.post('/materials/upload', upload.single('file'), async (req, res) => {
  try {
    const { lessonId, title, type, content, order } = req.body;

    if (!req.file || !lessonId || !title || !type) {
      return res.status(400).json({ success: false, message: 'Completá la clase, el título, el tipo y seleccioná un archivo.' });
    }

    const extension = fileExtension(req.file.originalname);
    if (!allowedExtensions.has(extension)) {
      return res.status(400).json({
        success: false,
        message: 'Formato no permitido. Podés subir PDF, PowerPoint, Word o imágenes.',
      });
    }

    if (!mongoose.connection.db) {
      return res.status(503).json({ success: false, message: 'La base de datos no está disponible. Intentá nuevamente.' });
    }

    const fileId = new mongoose.Types.ObjectId();
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'materials' });
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      id: fileId,
      contentType: req.file.mimetype || 'application/octet-stream',
      metadata: { uploadedBy: req.user._id.toString(), lessonId: lessonId.toString() },
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', resolve);
      uploadStream.end(req.file.buffer);
    });

    const material = await Material.create({
      lessonId,
      title: title.trim(),
      type,
      content: content || '',
      order: Number(order) || 1,
      fileId,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype || 'application/octet-stream',
      fileSize: req.file.size,
    });

    res.status(201).json({ success: true, message: 'Archivo cargado correctamente.', data: material });
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'El archivo supera el límite de 20 MB.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/materials', async (req, res) => {
  try {
    const { lessonId, title, type, url, content, order } = req.body;
    const material = await Material.create({
      lessonId,
      title,
      type: type || 'PDF',
      url: url || '',
      content: content || '',
      order: order || 1,
    });
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/materials/:id', async (req, res) => {
  try {
    const {title,type,url,content,order}=req.body;
    const material = await Material.findByIdAndUpdate(req.params.id, {title,type,url,content,order}, {new:true,runValidators:true});
    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/materials/:id', async (req, res) => {
  try {
    const material=await Material.findById(req.params.id);
    if (material) {await deleteStoredMaterial(material); await Material.deleteOne({_id:material._id});}
    res.json({ success: true, message: 'Material eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------- GESTIÓN DE EXÁMENES Y PREGUNTAS -----------------
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find().populate('lessonId', 'title order').populate('moduleId', 'title').sort({ createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// One association per exam; updates are partial for compatibility with the old client.
async function saveExam(req, res) {
  try {
    const exam = req.params.id ? await Exam.findById(req.params.id) : new Exam();
    if (!exam) return res.status(404).json({ success: false, message: 'Examen no encontrado' });
    const previousModule = String(exam.moduleId || '');
    const previousLesson = String(exam.lessonId || '');
    for (const key of ['title','description','passingScorePercent','status','maxAttemptsPerAuthorization']) {
      if (req.body[key] !== undefined) exam[key] = req.body[key];
    }
    if (req.body.lessonId !== undefined) exam.lessonId = req.body.lessonId || null;
    if (req.body.moduleId !== undefined) exam.moduleId = req.body.moduleId || null;
    if (exam.lessonId && exam.moduleId) throw new Error('Elegí una clase o un módulo, no ambos.');
    if (exam.lessonId && !await Lesson.exists({ _id: exam.lessonId })) throw new Error('Clase inexistente');
    if (exam.moduleId && !await Module.exists({ _id: exam.moduleId })) throw new Error('Módulo inexistente');
    if (req.params.id && (previousModule !== String(exam.moduleId || '') || previousLesson !== String(exam.lessonId || '')) &&
      (await ExamAttempt.exists({ examId: exam._id }) || await FinalAuthorization.exists({ examId: exam._id }))) throw new Error('No se puede cambiar la asociación de un examen con intentos o solicitudes. Creá otro examen para conservar el historial.');
    const association = exam.moduleId ? { moduleId: exam.moduleId } : exam.lessonId ? { lessonId: exam.lessonId } : null;
    if (association && await Exam.exists({ ...association, _id: { $ne: exam._id } })) {
      throw new Error('Ya existe un examen asociado. Editalo o desvinculalo antes de asociar otro.');
    }
    await exam.save();
    res.status(req.params.id ? 200 : 201).json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.code === 11000 ? 'Ya existe un examen vinculado a esa clase o módulo. Actualizá la página.' : error.message });
  }
}
router.post('/exams', saveExam);
router.put('/exams/:id', saveExam);

router.get('/exams/:examId/attempts', async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ examId: req.params.examId })
      .populate('studentId', 'firstName lastName username').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: attempts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/exams/:id', async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ examId: req.params.id });
    res.json({ success: true, message: 'Examen y sus preguntas eliminados' });
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
      options: options || [],
      correctOptionIndex: correctOptionIndex !== undefined ? correctOptionIndex : 0,
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
