import User from './models/User.js';
import Module from './models/Module.js';
import Lesson from './models/Lesson.js';
import Material from './models/Material.js';
import Exam from './models/Exam.js';
import Question from './models/Question.js';

export const seedInitialData = async () => {
  try {
    // 1. Asegurar la existencia del Administrador
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminExists = await User.findOne({ username: adminUsername });

    if (!adminExists) {
      const admin = new User({
        firstName: 'Administrador',
        lastName: 'INAVET',
        dni: '00000000',
        email: process.env.ADMIN_EMAIL || 'admin@inavet.com.ar',
        phone: '+54 11 7829-2771',
        username: adminUsername,
        passwordHash: process.env.ADMIN_PASSWORD || 'InavetAdmin2026!',
        role: 'ADMIN',
        status: 'ACTIVE',
        mustChangePassword: false,
      });
      await admin.save();
      console.log(`[Seed] Administrador creado: ${adminUsername}`);
    }

    // 2. Si no existen módulos ni clases, inicializar estructura de ejemplo del curso Auxiliar Veterinario
    const modulesCount = await Module.countDocuments();
    if (modulesCount === 0) {
      console.log('[Seed] Inicializando contenido educativo base para INAVET...');

      const mod1 = await Module.create({
        title: 'Módulo 1: Introducción a la Veterinaria y Rol del Auxiliar',
        description: 'Fundamentos de la atención clínica, bioseguridad y bienestar animal.',
        order: 1,
        status: 'ACTIVE',
      });

      const mod2 = await Module.create({
        title: 'Módulo 2: Manejo, Sujeción y Primeros Auxilios',
        description: 'Técnicas de contención segura y asistencia en situaciones de urgencia.',
        order: 2,
        status: 'ACTIVE',
      });

      // Clase 1
      const l1 = await Lesson.create({
        moduleId: mod1._id,
        title: 'Clase 1: El rol profesional del auxiliar veterinario',
        description: 'Funciones en la clínica, ética profesional y recepción de pacientes.',
        order: 1,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Link de demostración integrable
        status: 'ACTIVE',
      });

      // Materiales Clase 1
      const m1 = await Material.create({
        lessonId: l1._id,
        title: 'Guía de Introducción al Rol del Auxiliar (PDF)',
        type: 'PDF',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        order: 1,
      });

      const m2 = await Material.create({
        lessonId: l1._id,
        title: 'Normas Básicas de Bioseguridad en Consulta (Lectura)',
        type: 'TEXT',
        content: 'La bioseguridad clínica protege tanto a los animales como al personal. Es fundamental el uso de guantes, desinfección de camillas entre pacientes y correcto descarte de residuos patológicos.',
        order: 2,
      });

      // Examen Clase 1
      const exam1 = await Exam.create({
        lessonId: l1._id,
        title: 'Evaluación: Clase 1 - Rol del Auxiliar',
        description: 'Responda las siguientes preguntas para validar los conocimientos de la clase.',
        passingScorePercent: 70,
        status: 'ACTIVE',
      });

      await Question.create({
        examId: exam1._id,
        prompt: '¿Cuál es una de las funciones principales del auxiliar veterinario en la sala de consulta?',
        options: [
          'Prescribir antibióticos sin supervisión',
          'Asistir al médico veterinario en la contención y sujeción del paciente',
          'Realizar cirugías complejas de urgencia',
          'Emitir certificados sanitarios oficiales'
        ],
        correctOptionIndex: 1,
        order: 1,
      });

      await Question.create({
        examId: exam1._id,
        prompt: '¿Qué procedimiento de bioseguridad debe realizarse entre paciente y paciente?',
        options: [
          'Dejar la camilla sin limpiar si el animal se veía sano',
          'Limpiar y desinfectar la camilla y superficie de examen',
          'Rociar únicamente perfume en el ambiente',
          'Esperar al final del día para desinfectar todo'
        ],
        correctOptionIndex: 1,
        order: 2,
      });

      // Clase 2
      const l2 = await Lesson.create({
        moduleId: mod1._id,
        title: 'Clase 2: Bioseguridad e Higiene Hospitalaria',
        description: 'Protocolos de desinfección, esterilización y manejo de residuos patogénicos.',
        order: 2,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'ACTIVE',
      });

      const m3 = await Material.create({
        lessonId: l2._id,
        title: 'Manual de Desinfectantes y Esterilización (PDF)',
        type: 'PDF',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        order: 1,
      });

      const exam2 = await Exam.create({
        lessonId: l2._id,
        title: 'Evaluación: Clase 2 - Bioseguridad',
        description: 'Comprobación de conocimientos sobre esterilización.',
        passingScorePercent: 70,
        status: 'ACTIVE',
      });

      await Question.create({
        examId: exam2._id,
        prompt: '¿En qué recipiente se deben descartar las agujas y elementos cortopunzantes?',
        options: [
          'En la bolsa de residuos común',
          'En el descartador rígido específico para cortopunzantes',
          'En una caja de cartón abierta',
          'En el canasto de reciclaje'
        ],
        correctOptionIndex: 1,
        order: 1,
      });

      // Clase 3 (en Módulo 2)
      await Lesson.create({
        moduleId: mod2._id,
        title: 'Clase 3: Métodos de sujeción no traumática en caninos y felinos',
        description: 'Manejo "cat friendly" y técnicas de inmovilización segura.',
        order: 3,
        status: 'ACTIVE',
      });

      console.log('[Seed] Módulos, clases de prueba y exámenes inicializados.');
    }
  } catch (error) {
    console.error(`[Seed] Error al inicializar datos: ${error.message}`);
  }
};
