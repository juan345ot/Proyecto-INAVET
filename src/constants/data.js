export const CONTACT_INFO = {
    whatsapp: '542926451511',
    whatsappDisplay: '2926 45-1511',
    instagram: 'institutoinavet',
    instagramUrl: 'https://instagram.com/institutoinavet',
    email: 'contacto@inavet.com', // Placeholder if needed in future
};

export const COURSE_INFO = {
    price: '$49.000',
    duration: '7 meses',
    certification: 'Certificado INAVET / Cámara Argentina para la Formación Profesional',
};

export const NAV_LINKS = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Inavet', id: 'inavet' },
    { name: 'Modalidad', id: 'modalidad' },
    { name: 'Inversión', id: 'inversion' },
    { name: 'FAQ', id: 'faq' },
];

export const FAQ_DATA = [
    {
        question: "¿Tengo que conectarme en vivo?",
        answer: "No. Las clases quedan grabadas para que las veas cuando quieras."
    },
    {
        question: "¿Necesito experiencia previa?",
        answer: "No. La formación está pensada desde nivel inicial."
    },
    {
        question: "¿Hay prácticas presenciales?",
        answer: ""
    },
    {
        question: "¿El certificado tiene validez?",
        answer: "El certificado INAVET es institucional. La certificación UTN será opcional en caso de confirmarse."
    }
];

export const MODULES_DATA = [
    {
        title: "Anatomía y semiología veterinaria",
        description: "Estudio de las bases anatómicas y reconocimiento de signos clínicos fundamentales para la asistencia en consulta veterinaria."
    },
    {
        title: "Procedimientos e instrumental veterinario",
        description: "Conocimiento y uso del instrumental básico, materiales y maniobras esenciales en la práctica auxiliar clínica."
    },
    {
        title: "Primeros auxilios veterinarios",
        description: "Actuación inicial ante situaciones de urgencia, contención del paciente y asistencia en emergencias frecuentes."
    },
    {
        title: "Cirugía y asistencia quirúrgica veterinaria",
        description: "Principios básicos del ámbito quirúrgico, preparación del paciente, esterilización y apoyo al profesional durante procedimientos."
    },
    {
        title: "Farmacología veterinaria",
        description: "Nociones sobre medicamentos de uso frecuente, vías de administración y rol del auxiliar en su correcta aplicación."
    },
    {
        title: "Enfermedades infecciosas veterinarias",
        description: "Conceptos fundamentales sobre virus, bacterias y parásitos, prevención y medidas básicas de control sanitario."
    },
    {
        title: "Instalaciones y organización del ámbito veterinario",
        description: "Funcionamiento de clínicas y consultorios, organización del espacio, bioseguridad y dinámica del trabajo profesional."
    }
];

export const MODALITY_DATA = {
    features: [
        {
            title: "Clases en vivo grabadas",
            description: "Disponibles las 24 hs. No es obligatorio conectarse al vivo.",
            icon: "Video"
        },
        {
            title: "Inicio flexible",
            description: "Podés comenzar en cualquier mes del año, sin esperar fechas de inscripción.",
            icon: "Calendar"
        },
        {
            title: "100% online",
            description: "Ideal para quienes trabajan o tienen otros estudios.",
            icon: "Globe"
        }
    ],
    modulesCount: 7,
    duration: COURSE_INFO.duration,
    access: "durante toda la cursada"
};
