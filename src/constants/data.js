import heroImage from "../assets/Hero.jpg";
import carrusel1 from "../assets/auxiliares/Carrete (1).jpg.jpeg";
import carrusel2 from "../assets/auxiliares/Carrete (2).jpg.jpeg";
import carrusel3 from "../assets/auxiliares/Carrete (3).jpg.jpeg";
import carrusel4 from "../assets/auxiliares/Carrete (4).jpg.jpeg";
import carrusel5 from "../assets/auxiliares/Carrete (5).jpg.jpeg";
import carrusel6 from "../assets/auxiliares/Carrete (6).jpg.jpeg";
import carrusel7 from "../assets/auxiliares/Carrete (7).jpg.jpeg";
import carrusel8 from "../assets/auxiliares/Carrete (8).jpg.jpeg";
import luloperfil from "../assets/luloperfil.jpg.jpeg";
import lulo2 from "../assets/direccion/lulo2.jpg.jpeg";
import lulo3 from "../assets/direccion/lulo3.jpg.jpeg"; 
import lulo4 from "../assets/direccion/lulo4.jpg.jpeg";
import lulo5 from "../assets/direccion/lulo5.jpg.jpeg";
import lulo6 from "../assets/direccion/lulo6.jpg.jpeg";

export const CONTACT_INFO = {
  whatsapp: "541178292771",
  whatsappDisplay: "+54 11 7829-2771",
  instagram: "institutoinavet",
  instagramUrl: "https://instagram.com/institutoinavet",
  email: "contacto@inavet.com", 
  whatsappMessage:
    "Hola, quisiera más información sobre el curso de Auxiliar Veterinario",
  whatsappMessageEncoded:
    "Hola,%20quisiera%20más%20información%20sobre%20el%20curso%20de%20Auxiliar%20Veterinario",
};

export const COURSE_INFO = {
  price: "$49.000",
  duration: "7 meses",
  certification:
    "Certificado INAVET / Cámara Argentina para la Formación Profesional",
};

export const NAV_LINKS = [
  { name: "Inicio", id: "inicio" },
  { name: "Objetivos", id: "objetivos" },
  { name: "Modalidad", id: "modalidad" },
  { name: "¿Qué es Inavet?", id: "inavet" },
  { name: "Inversión", id: "inversion" },
  { name: "FAQ", id: "faq" },
];

export const HERO_DATA = {
  title:
    "Formate como \nAuxiliar Veterinario \ny desarrollá tu salida laboral con animales",
  subtitle: "Capacitación 100% online con certificación y orientación laboral",
  image: heroImage,
  features: [
    "Estudiá desde cualquier lugar",
    "Clases en vivo grabadas",
    "Comenzá en cualquier mes del año",
    "Sin requisitos previos",
  ],
  ctaText: "Inscribirme / Pedir información",
};

export const TARGET_AUDIENCE_DATA = {
  title: "¿PARA QUIÉN ES ESTA FORMACIÓN?",
  items: [
    "Personas sin experiencia previa que desean iniciar su camino en el ámbito veterinario",
    "Quienes trabajan y necesitan una formación con horarios flexibles",
    "Personas interesadas en desarrollarse en el cuidado y la salud animal",
    "Quienes buscan una salida laboral vinculada al sector veterinario",
  ],
  note: "No se requieren conocimientos previos",
};

export const OUTCOME_DATA = {
  title: "¿Qué vas a poder hacer al finalizar?",
  items: [
    "Aplicar conocimientos básicos en entornos clínicos, rurales o de manejo animal",
    "Incorporar los fundamentos teóricos de los procedimientos habituales del auxiliar",
    "Comprender el funcionamiento básico de una clínica veterinaria",
    "Asistir al profesional en tareas generales de consulta",
    "Manejar correctamente normas básicas de higiene y bioseguridad",
    "Reconocer signos clínicos frecuentes en animales",
    "Colaborar en la organización y asistencia del área de trabajo",
    "Desempeñarte como auxiliar en distintos ámbitos vinculados a la salud animal",
  ],
  summary:
    "Estarás preparado para dar tus primeros pasos en el ámbito laboral vinculado al cuidado y la salud animal",
};

export const CAROUSEL_DATA = {
  title: "AUXILIARES VETERINARIOS EN ACCIÓN",
  images: [
    { id: 1, src: carrusel5, alt: "Auxiliar veterinario trabajando 5" },
    { id: 2, src: carrusel7, alt: "Auxiliar veterinario trabajando 7" },
    { id: 3, src: carrusel4, alt: "Auxiliar veterinario trabajando 4" },
    { id: 4, src: carrusel8, alt: "Auxiliar veterinario trabajando 8" },
    { id: 5, src: carrusel1, alt: "Auxiliar veterinario trabajando 1" },
    { id: 6, src: carrusel2, alt: "Auxiliar veterinario trabajando 2" },
    { id: 7, src: carrusel3, alt: "Auxiliar veterinario trabajando 3" },
    { id: 8, src: carrusel6, alt: "Auxiliar veterinario trabajando 6" },
  ],
};

export const INAVET_INFO_DATA = {
  title: "¿QUÉ ES INAVET?",
  description1:
    "INAVET es un instituto de formación especializado en la capacitación de Auxiliares Veterinarios, con modalidad 100% online y orientación práctica.",
  description2:
    "Brindamos una formación estructurada por áreas clave del ámbito veterinario, destinada a quienes buscan desarrollar conocimientos sólidos y aplicables en el ejercicio del rol auxiliar.",
};

export const ACADEMIC_DIRECTION_DATA = {
  title: "Dirección y Coordinación Académica",
  image: luloperfil,
  paragraphs: [
    "La formación está dirigida por el Médico Veterinario Lucas Palacio, con experiencia en clínica de pequeños animales y exóticos, especialista en fauna silvestre y Magíster en Gestión de Fauna Silvestre y Bienestar Animal.",
    "Su trayectoria profesional en el ámbito clínico y de conservación respalda el enfoque académico y la calidad de la formación.",
  ],
};

export const DIRECTION_GALLERY_DATA = {
  title: "DIRECCIÓN EN ACCIÓN",
  images: [
    { id: 1, src: lulo5, alt: "Dirección en acción 1" },
    { id: 2, src: lulo4, alt: "Dirección en acción 2" },
    { id: 3, src: lulo6, alt: "Dirección en acción 3" },
    { id: 4, src: lulo3, alt: "Dirección en acción 4" },
    { id: 5, src: lulo2, alt: "Dirección en acción 5" },
  ],
};

export const FINAL_CTA_DATA = {
  title: "¿Querés recibir más información o inscribirte?",
  subtitle:
    "Estamos listos para asesorarte y ayudarte a dar el primer paso en tu carrera profesional.",
  buttonText: "Inscribirme / Pedir información",
  whatsappNote: "¡Respondemos al instante!",
};

export const FAQ_DATA = [
  {
    question: "¿Tengo que conectarme en vivo?",
    answer: "No. Las clases quedan grabadas para que las veas cuando quieras.",
  },
  {
    question: "¿Necesito experiencia previa?",
    answer: "No. La formación está pensada desde nivel inicial.",
  },
  {
    question: "¿El certificado tiene validez?",
    answer:
      "Sí. El curso otorga un certificado de capacitación laboral emitido por la Cámara Argentina de Comercio y Capacitación Laboral. Tiene validez como formación complementaria y antecedente curricular en el ámbito privado. La emisión del certificado es opcional y requiere el pago del arancel correspondiente a la entidad certificadora. Además, todos los alumnos que finalicen el curso recibirán un certificado institucional firmado por el Director y Médico Veterinario a cargo, que acredita la realización y aprobación de la capacitación.",
  },
];

export const MODULES_DATA = [
  {
    title: "Anatomía y semiología veterinaria",
    description:
      "Estudio de las bases anatómicas y reconocimiento de signos clínicos fundamentales para la asistencia en consulta veterinaria.",
  },
  {
    title: "Procedimientos básicos e instrumental veterinario",
    description:
      "Conocimiento y uso del instrumental básico, sujeción del paciente, materiales y maniobras esenciales en la práctica del auxiliar veterinario.",
  },
  {
    title: "Primeros auxilios veterinarios",
    description:
      "Actuación inicial del auxiliar veterinario en situaciones de urgencias y emergencias frecuentes, maniobra de RCP.",
  },
  {
    title: "Cirugía y asistencia quirúrgica veterinaria",
    description:
      "Principios básicos del ámbito quirúrgico, integrantes del equipo quirúrgico y sus roles, preparación del paciente, esterilización y apoyo al profesional durante procedimientos.",
  },
  {
    title: "Farmacología veterinaria",
    description:
      "Nociones sobre medicamentos de uso frecuente, vías de administración y rol del auxiliar en su correcta aplicación.",
  },
  {
    title: "Enfermedades infecciosas veterinarias",
    description:
      "Conceptos fundamentales sobre virus, bacterias, parásitos y hongos. Prevención y medidas básicas de control sanitario.",
  },
  {
    title: "Instalaciones y organización profesional",
    description:
      "Funcionamiento de clínicas y consultorios, planillas, certificados y documentación de interés profesional, organización del espacio, bioseguridad y dinámica del trabajo del auxiliar veterinario.",
  },
];

export const PRICING_DATA = {
  title: "INVERSIÓN",
  paymentMethodsTitle: "MEDIOS DE PAGO",
  cuotaLabel: "Valor Cuota Mensual",
  cuotaCurrency: "ARS / mes",
  bonusTag: "MATRÍCULA BONIFICADA POR APERTURA",
  features: [
    "Posibilidad de pago mensual",
    "Descuento especial por pago completo (10%)"
  ],
  methods: [
    {
      name: "Mercado Pago",
      description: "Tarjetas de crédito, débito, cuotas y transferencia.",
      icon: "CreditCard"
    },
    {
      name: "Transferencia Bancaria",
      description: "Directo y seguro.",
      icon: "Banknote"
    }
  ]
};

export const MODALITY_DATA = {
  features: [
    {
      title: "Clases en vivo grabadas",
      description:
        "Disponibles las 24 hs. No es obligatorio conectarse al vivo.",
      icon: "Video",
    },
    {
      title: "Inicio flexible",
      description:
        "Podés comenzar en cualquier mes del año, sin esperar fechas de inscripción.",
      icon: "Calendar",
    },
    {
      title: "100% online",
      description: "Ideal para quienes trabajan o tienen otros estudios.",
      icon: "Globe",
    },
  ],
  modulesCount: 7,
  duration: COURSE_INFO.duration,
  access: "durante toda la cursada",
};
