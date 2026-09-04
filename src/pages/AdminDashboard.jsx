import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Layers,
  Award,
  LogOut,
  Plus,
  KeyRound,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  CheckCircle2,
  X,
  HelpCircle,
  Link as LinkIcon,
  Play,
  Settings,
} from 'lucide-react';
import logo from '../assets/logo.png';
import { apiFetch } from '../lib/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('modulos'); // 'modulos' | 'examenes' | 'alumnos'
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [curriculum, setCurriculum] = useState([]); // Módulos con clases, materiales y examen anidados
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Módulos desplegados (acordeón)
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  // Modales
  const [modalType, setModalType] = useState(null); // 'MODULE' | 'LESSON' | 'MATERIAL' | 'EXAM' | 'QUESTION' | 'STUDENT' | 'RESET_PASS'
  const [modalData, setModalData] = useState(null); // Datos para editar o asociar

  // Estados de formularios
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: 1 });
  const [lessonForm, setLessonForm] = useState({ moduleId: '', title: '', description: '', order: 1, videoUrl: '', examId: '' });
  const [materialForm, setMaterialForm] = useState({ lessonId: '', title: '', type: 'PDF', url: '', content: '', order: 1 });
  const [examForm, setExamForm] = useState({ title: '', description: '', passingScorePercent: 70, lessonId: '' });
  const [questionForm, setQuestionForm] = useState({ examId: '', prompt: '', options: ['', '', '', ''], correctOptionIndex: 0 });
  const [examQuestions, setExamQuestions] = useState([]);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);

  // Alumnos
  const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', dni: '', email: '', phone: '', username: '', password: '', status: 'ACTIVE' });
  const [tempPassword, setTempPassword] = useState('');

  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [resStats, resStudents, resTree, resExams] = await Promise.all([
        apiFetch('/api/admin/stats', { headers }).then((r) => r.json()),
        apiFetch('/api/admin/students', { headers }).then((r) => r.json()),
        apiFetch('/api/admin/curriculum-tree', { headers }).then((r) => r.json()),
        apiFetch('/api/admin/exams', { headers }).then((r) => r.json()),
      ]);

      if (resStats.success) setStats(resStats.data);
      if (resStudents.success) setStudents(resStudents.data);
      if (resTree.success) {
        setCurriculum(resTree.data);
        // Expandir por defecto todos los módulos
        const initialExpanded = {};
        resTree.data.forEach((m) => {
          initialExpanded[m._id] = true;
        });
        setExpandedModules(initialExpanded);
      }
      if (resExams.success) setExams(resExams.data);
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLesson = (id) => {
    setExpandedLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------------- GESTIÓN DE MÓDULOS ----------------
  const openModuleModal = (mod = null) => {
    if (mod) {
      setModuleForm({ title: mod.title, description: mod.description || '', order: mod.order || 1 });
      setModalData(mod);
    } else {
      setModuleForm({ title: '', description: '', order: curriculum.length + 1 });
      setModalData(null);
    }
    setModalType('MODULE');
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    try {
      const url = modalData ? `/api/admin/modules/${modalData._id}` : '/api/admin/modules';
      const method = modalData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(moduleForm),
      });
      const data = await res.json();
      if (data.success) {
        setModalType(null);
        fetchAllData();
      } else {
        alert(data.message || 'Error al guardar módulo');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDeleteModule = async (id, title) => {
    if (!window.confirm(`¿Seguro que querés eliminar el módulo "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/modules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchAllData();
      else alert(data.message || 'Error al eliminar');
    } catch (err) {
      alert('Error al conectar');
    }
  };

  // ---------------- GESTIÓN DE CLASES ----------------
  const openLessonModal = (moduleId, lesson = null) => {
    if (lesson) {
      setLessonForm({
        moduleId,
        title: lesson.title,
        description: lesson.description || '',
        order: lesson.order || 1,
        videoUrl: lesson.videoUrl || '',
        examId: lesson.exam ? lesson.exam._id : '',
      });
      setModalData(lesson);
    } else {
      // Calcular siguiente orden sugerido
      let totalLessons = 0;
      curriculum.forEach((m) => {
        totalLessons += (m.lessons || []).length;
      });
      setLessonForm({
        moduleId,
        title: '',
        description: '',
        order: totalLessons + 1,
        videoUrl: '',
        examId: '',
      });
      setModalData(null);
    }
    setModalType('LESSON');
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      const url = modalData ? `/api/admin/lessons/${modalData._id}` : '/api/admin/lessons';
      const method = modalData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(lessonForm),
      });
      const data = await res.json();

      if (data.success) {
        const savedLessonId = modalData ? modalData._id : data.data._id;

        // Si se seleccionó un examen para asociar a esta clase
        if (lessonForm.examId) {
          await fetch(`/api/admin/exams/${lessonForm.examId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ lessonId: savedLessonId }),
          });
        }

        setModalType(null);
        fetchAllData();
      } else {
        alert(data.message || 'Error al guardar clase');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDeleteLesson = async (id, title) => {
    if (!window.confirm(`¿Seguro que querés eliminar la clase "${title}" y sus materiales?`)) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchAllData();
      else alert(data.message || 'Error al eliminar');
    } catch (err) {
      alert('Error al conectar');
    }
  };

  // ---------------- GESTIÓN DE MATERIALES ----------------
  const openMaterialModal = (lessonId, mat = null) => {
    if (mat) {
      setMaterialForm({
        lessonId,
        title: mat.title,
        type: mat.type,
        url: mat.url || '',
        content: mat.content || '',
        order: mat.order || 1,
      });
      setModalData(mat);
    } else {
      setMaterialForm({
        lessonId,
        title: '',
        type: 'PDF',
        url: '',
        content: '',
        order: 1,
      });
      setModalData(null);
    }
    setModalType('MATERIAL');
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      const url = modalData ? `/api/admin/materials/${modalData._id}` : '/api/admin/materials';
      const method = modalData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(materialForm),
      });
      const data = await res.json();
      if (data.success) {
        setModalType(null);
        fetchAllData();
      } else {
        alert(data.message || 'Error al guardar material');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este material?')) return;
    try {
      const res = await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchAllData();
    } catch (err) {
      alert('Error al conectar');
    }
  };

  // ---------------- GESTIÓN DE EXÁMENES ----------------
  const openExamModal = (exam = null) => {
    if (exam) {
      setExamForm({
        title: exam.title,
        description: exam.description || '',
        passingScorePercent: exam.passingScorePercent || 70,
        lessonId: exam.lessonId ? (exam.lessonId._id || exam.lessonId) : '',
      });
      setModalData(exam);
    } else {
      setExamForm({
        title: '',
        description: '',
        passingScorePercent: 70,
        lessonId: '',
      });
      setModalData(null);
    }
    setModalType('EXAM');
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      const url = modalData ? `/api/admin/exams/${modalData._id}` : '/api/admin/exams';
      const method = modalData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(examForm),
      });
      const data = await res.json();
      if (data.success) {
        setModalType(null);
        fetchAllData();
      } else {
        alert(data.message || 'Error al guardar examen');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`¿Seguro que querés eliminar el examen "${title}" y todas sus preguntas?`)) return;
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchAllData();
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const openQuestionsManager = async (exam) => {
    setSelectedExamForQuestions(exam);
    try {
      const res = await fetch(`/api/admin/exams/${exam._id}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setExamQuestions(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setQuestionForm({
      examId: exam._id,
      prompt: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
    });
    setModalType('QUESTION');
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const validOptions = questionForm.options.filter((o) => o.trim() !== '');
      if (validOptions.length < 2) {
        alert('Debe ingresar al menos 2 opciones de respuesta');
        return;
      }

      const res = await apiFetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...questionForm,
          options: validOptions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestionForm({
          examId: selectedExamForQuestions._id,
          prompt: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
        });
        // Refrescar preguntas del examen
        const resQ = await fetch(`/api/admin/exams/${selectedExamForQuestions._id}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataQ = await resQ.json();
        if (dataQ.success) setExamQuestions(dataQ.data);
      }
    } catch (err) {
      alert('Error al guardar pregunta');
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resQ = await fetch(`/api/admin/exams/${selectedExamForQuestions._id}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataQ = await resQ.json();
      if (dataQ.success) setExamQuestions(dataQ.data);
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  // ---------------- GESTIÓN DE ALUMNOS ----------------
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(studentForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('Alumno creado con éxito con contraseña temporal');
        setModalType(null);
        setStudentForm({ firstName: '', lastName: '', dni: '', email: '', phone: '', username: '', password: '', status: 'ACTIVE' });
        fetchAllData();
      } else {
        alert(data.message || 'Error al crear alumno');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!modalData || !tempPassword) return;
    try {
      const res = await fetch(`/api/admin/students/${modalData._id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tempPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setModalType(null);
        setTempPassword('');
        setModalData(null);
      } else {
        alert(data.message || 'Error al resetear');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleToggleStudentStatus = async (student) => {
    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch(`/api/admin/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Lista plana de todas las clases para los selectores
  const allLessons = [];
  curriculum.forEach((m) => {
    (m.lessons || []).forEach((l) => {
      allLessons.push(l);
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="INAVET" className="h-12 object-contain" />
            <div>
              <span className="font-black text-primary text-lg tracking-tight">INAVET</span>
              <span className="ml-2 text-xs uppercase font-black bg-secondary/90 text-white px-3 py-1 rounded-full">
                Panel Administrativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">
              Usuario: <span className="text-primary font-bold">{user?.username}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Selector de Pestañas */}
      <div className="bg-white border-b border-slate-200 shadow-xs sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 py-3 overflow-x-auto">
          {[
            { id: 'modulos', label: 'Gestión de Curso (Módulos, Clases y Materiales)', icon: Layers },
            { id: 'examenes', label: 'Banco de Exámenes y Preguntas', icon: Award },
            { id: 'alumnos', label: 'Gestión de Alumnos', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Estadísticas Rápidas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alumnos</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalStudents}</p>
              <span className="text-xs text-emerald-600 font-bold">{stats.activeStudents} activos</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Módulos</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{curriculum.length}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clases Activas</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalLessons}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exámenes Creados</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{exams.length}</p>
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA: GESTIÓN DE CURSO (MÓDULOS Y CLASES) ---------------- */}
        {activeTab === 'modulos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Estructura y Contenidos del Curso
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Desplegá cada módulo para ver y editar sus clases, subir materiales y asociar exámenes.
                </p>
              </div>

              <button
                onClick={() => openModuleModal()}
                className="px-6 py-3.5 bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Plus size={16} />
                <span>Agregar Módulo</span>
              </button>
            </div>

            {/* Listado Desplegable de Módulos */}
            <div className="space-y-5">
              {curriculum.map((mod) => {
                const isExpanded = !!expandedModules[mod._id];

                return (
                  <div
                    key={mod._id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Fila Cabecera del Módulo */}
                    <div className="p-6 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-4">
                      <div
                        onClick={() => toggleModule(mod._id)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
                      >
                        <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-secondary tracking-wider">
                              Módulo {mod.order}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              ({(mod.lessons || []).length} clases)
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-800 truncate mt-0.5">
                            {mod.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openLessonModal(mod._id)}
                          className="px-3.5 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Agregar Clase a este Módulo"
                        >
                          <Plus size={14} />
                          <span className="hidden sm:inline">Agregar Clase</span>
                        </button>
                        <button
                          onClick={() => openModuleModal(mod)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-secondary hover:border-secondary transition-all cursor-pointer"
                          title="Editar Módulo"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod._id, mod.title)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
                          title="Eliminar Módulo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Contenido Desplegable: Clases del Módulo */}
                    {isExpanded && (
                      <div className="p-6 space-y-4">
                        {(mod.lessons || []).length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            No hay clases creadas en este módulo aún. Hacé clic en "Agregar Clase".
                          </div>
                        ) : (
                          mod.lessons.map((lesson) => {
                            const isLessonExp = !!expandedLessons[lesson._id];

                            return (
                              <div
                                key={lesson._id}
                                className="bg-slate-50/50 rounded-2xl border border-slate-200 p-5 space-y-4"
                              >
                                {/* Fila de la Clase */}
                                <div className="flex items-center justify-between gap-4">
                                  <div
                                    onClick={() => toggleLesson(lesson._id)}
                                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                  >
                                    <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                      {isLessonExp ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                    </button>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-black uppercase text-primary tracking-wider">
                                          Clase {lesson.order} (Orden correlativo)
                                        </span>
                                        {lesson.videoUrl && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-200">
                                            <Video size={11} /> Con Video
                                          </span>
                                        )}
                                        {lesson.exam && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                                            <Award size={11} /> Examen: {lesson.exam.title}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">
                                        {lesson.title}
                                      </h4>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => openMaterialModal(lesson._id)}
                                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-primary text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                      title="Agregar Material a esta Clase"
                                    >
                                      <Plus size={13} />
                                      <span className="hidden sm:inline">Material</span>
                                    </button>
                                    <button
                                      onClick={() => openLessonModal(mod._id, lesson)}
                                      className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-secondary hover:border-secondary transition-all cursor-pointer"
                                      title="Editar Clase"
                                    >
                                      <Edit3 size={15} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                                      className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
                                      title="Eliminar Clase"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>

                                {/* Desplegable de la Clase: Video, Materiales y Examen */}
                                {isLessonExp && (
                                  <div className="pt-3 border-t border-slate-200/70 pl-10 space-y-3">
                                    {lesson.videoUrl && (
                                      <div className="text-xs text-slate-600 flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                                        <Video size={16} className="text-rose-600 shrink-0" />
                                        <span className="font-bold">Video:</span>
                                        <a
                                          href={lesson.videoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-primary hover:underline truncate"
                                        >
                                          {lesson.videoUrl}
                                        </a>
                                      </div>
                                    )}

                                    {/* Materiales */}
                                    <div className="space-y-2">
                                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                        Materiales ({lesson.materials?.length || 0})
                                      </span>
                                      {lesson.materials?.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">No hay materiales en esta clase.</p>
                                      ) : (
                                        lesson.materials.map((mat) => (
                                          <div
                                            key={mat._id}
                                            className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <FileText size={15} className="text-secondary shrink-0" />
                                              <span className="font-bold text-slate-800 truncate">{mat.title}</span>
                                              <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                {mat.type}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                              {mat.url && (
                                                <a
                                                  href={mat.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-primary hover:underline text-xs font-bold"
                                                >
                                                  Ver Link
                                                </a>
                                              )}
                                              <button
                                                onClick={() => openMaterialModal(lesson._id, mat)}
                                                className="text-slate-400 hover:text-secondary"
                                              >
                                                <Edit3 size={13} />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteMaterial(mat._id)}
                                                className="text-slate-400 hover:text-rose-600"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    {/* Examen de la Clase */}
                                    <div className="pt-2">
                                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                        Examen Asociado
                                      </span>
                                      {lesson.exam ? (
                                        <div className="mt-1 bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <Award size={16} className="text-amber-700" />
                                            <span className="font-bold text-amber-900">{lesson.exam.title}</span>
                                            <span className="text-amber-700 text-[11px]">
                                              (Aprobación mínima: {lesson.exam.passingScorePercent}%)
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => openQuestionsManager(lesson.exam)}
                                            className="font-bold text-secondary hover:underline cursor-pointer"
                                          >
                                            Administrar Preguntas
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="mt-1 text-xs text-slate-400 italic flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                                          <span>Esta clase no tiene examen asociado.</span>
                                          <button
                                            onClick={() => openLessonModal(mod._id, lesson)}
                                            className="font-bold text-secondary hover:underline cursor-pointer"
                                          >
                                            + Asociar Examen
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA: BANCO DE EXÁMENES ---------------- */}
        {activeTab === 'examenes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Banco de Exámenes y Preguntas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Creá, editá exámenes, configurá el porcentaje de aprobación y agregá preguntas autocorregibles.
                </p>
              </div>

              <button
                onClick={() => openExamModal()}
                className="px-6 py-3.5 bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Plus size={16} />
                <span>Crear Nuevo Examen</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {exams.map((ex) => (
                <div
                  key={ex._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-secondary">
                        {ex.lessonId ? `Asociado a: ${ex.lessonId.title || 'Clase'}` : 'Sin Clase Asociada'}
                      </span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        Mínimo: {ex.passingScorePercent}%
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-800">{ex.title}</h3>
                    {ex.description && <p className="text-xs text-slate-500">{ex.description}</p>}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openQuestionsManager(ex)}
                      className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <HelpCircle size={14} />
                      <span>Gestionar Preguntas</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openExamModal(ex)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-secondary hover:bg-slate-200 transition-all cursor-pointer"
                        title="Editar Examen"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(ex._id, ex.title)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Eliminar Examen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA: ALUMNOS ---------------- */}
        {activeTab === 'alumnos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Alumnos del Instituto
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Creá nuevos alumnos, reseteá contraseñas temporales y activá o desactivá cuentas.
                </p>
              </div>

              <button
                onClick={() => {
                  setStudentForm({ firstName: '', lastName: '', dni: '', email: '', phone: '', username: '', password: '', status: 'ACTIVE' });
                  setModalType('STUDENT');
                }}
                className="px-6 py-3.5 bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Plus size={16} />
                <span>Nuevo Alumno</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">DNI / Usuario</th>
                      <th className="p-4">Email / Teléfono</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/60">
                        <td className="p-4 font-bold text-slate-800">
                          {st.firstName} {st.lastName}
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-600">
                          <div>DNI: {st.dni}</div>
                          <div className="text-primary font-bold">@{st.username}</div>
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          <div>{st.email}</div>
                          <div>{st.phone || '-'}</div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStudentStatus(st)}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                              st.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {st.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setModalData(st);
                              setTempPassword('');
                              setModalType('RESET_PASS');
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            title="Resetear Contraseña"
                          >
                            <KeyRound size={14} />
                            <span>Reset Clave</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------- MODAL MÓDULO ---------------- */}
      {modalType === 'MODULE' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-5">
            <h3 className="text-xl font-black text-slate-800">
              {modalData ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
            </h3>
            <form onSubmit={handleSaveModule} className="space-y-4 text-xs font-bold text-slate-600">
              <div>
                <label className="block mb-1">Título del Módulo</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Ej: Módulo 1: Introducción a la Veterinaria"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Descripción</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1">Número de Orden</label>
                <input
                  type="number"
                  required
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover cursor-pointer"
                >
                  Guardar Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL CLASE ---------------- */}
      {modalType === 'LESSON' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5">
            <h3 className="text-xl font-black text-slate-800">
              {modalData ? 'Editar Clase' : 'Agregar Nueva Clase'}
            </h3>
            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs font-bold text-slate-600">
              <div>
                <label className="block mb-1">Título de la Clase</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Ej: Clase 1: El rol profesional del auxiliar"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Descripción</label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Orden Correlativo Global</label>
                  <input
                    type="number"
                    required
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                  <span className="text-[10px] text-slate-400 font-normal">
                    Determina el orden de desbloqueo secuencial
                  </span>
                </div>

                <div>
                  <label className="block mb-1">Examen Asociado</label>
                  <select
                    value={lessonForm.examId}
                    onChange={(e) => setLessonForm({ ...lessonForm, examId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  >
                    <option value="">-- Sin Examen --</option>
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex._id}>
                        {ex.title} ({ex.passingScorePercent}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Enlace de Video Externo (YouTube u otro)</label>
                <input
                  type="url"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover cursor-pointer"
                >
                  Guardar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL MATERIAL ---------------- */}
      {modalType === 'MATERIAL' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-5">
            <h3 className="text-xl font-black text-slate-800">
              {modalData ? 'Editar Material' : 'Agregar Material a la Clase'}
            </h3>
            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs font-bold text-slate-600">
              <div>
                <label className="block mb-1">Título del Material</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="Ej: Manual de Primeros Auxilios (PDF)"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Tipo de Recurso</label>
                <select
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                >
                  <option value="PDF">Documento PDF</option>
                  <option value="PPT">PowerPoint (PPT / PPTX)</option>
                  <option value="DOC">Word (DOC / DOCX)</option>
                  <option value="IMAGE">Imagen</option>
                  <option value="LINK">Enlace Externo</option>
                  <option value="TEXT">Texto / Apunte</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">URL del Archivo o Enlace</label>
                <input
                  type="url"
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Contenido de Texto (opcional)</label>
                <textarea
                  value={materialForm.content}
                  onChange={(e) => setMaterialForm({ ...materialForm, content: e.target.value })}
                  rows={3}
                  placeholder="Apuntes o resumen explicativo para el alumno..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover cursor-pointer"
                >
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL EXAMEN ---------------- */}
      {modalType === 'EXAM' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-5">
            <h3 className="text-xl font-black text-slate-800">
              {modalData ? 'Editar Examen' : 'Crear Nuevo Examen'}
            </h3>
            <form onSubmit={handleSaveExam} className="space-y-4 text-xs font-bold text-slate-600">
              <div>
                <label className="block mb-1">Nombre / Título del Examen</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="Ej: Evaluación Clase 1 - Bioseguridad"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Descripción</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Porcentaje de Aprobación</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={examForm.passingScorePercent}
                    onChange={(e) => setExamForm({ ...examForm, passingScorePercent: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                  <span className="text-[10px] text-slate-400 font-normal">Por defecto: 70%</span>
                </div>

                <div>
                  <label className="block mb-1">Asociar a Clase</label>
                  <select
                    value={examForm.lessonId}
                    onChange={(e) => setExamForm({ ...examForm, lessonId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  >
                    <option value="">-- Ninguna por ahora --</option>
                    {allLessons.map((l) => (
                      <option key={l._id} value={l._id}>
                        Clase {l.order}: {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover cursor-pointer"
                >
                  Guardar Examen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL PREGUNTAS DE EXAMEN ---------------- */}
      {modalType === 'QUESTION' && selectedExamForQuestions && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-secondary">
                  Preguntas del Examen
                </span>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">
                  {selectedExamForQuestions.title}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Listado de preguntas existentes */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-slate-400">
                Preguntas Actuales ({examQuestions.length})
              </span>
              {examQuestions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay preguntas cargadas en este examen.</p>
              ) : (
                examQuestions.map((q, idx) => (
                  <div key={q._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-bold text-slate-800 text-sm">
                        {idx + 1}. {q.prompt}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="text-slate-400 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl border ${
                            optIdx === q.correctOptionIndex
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {optIdx === q.correctOptionIndex && '✓ '} {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Formulario para agregar nueva pregunta */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-slate-800">Agregar Nueva Pregunta</h4>
              <form onSubmit={handleAddQuestion} className="space-y-4 text-xs font-bold text-slate-600">
                <div>
                  <label className="block mb-1">Enunciado de la Pregunta</label>
                  <input
                    type="text"
                    required
                    value={questionForm.prompt}
                    onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
                    placeholder="Ej: ¿Qué temperatura rectal normal presenta un canino?"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block">Opciones y Respuesta Correcta</label>
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={questionForm.correctOptionIndex === idx}
                        onChange={() => setQuestionForm({ ...questionForm, correctOptionIndex: idx })}
                        className="w-4 h-4 text-primary cursor-pointer"
                        title="Marcar como respuesta correcta"
                      />
                      <input
                        type="text"
                        required={idx < 2}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...questionForm.options];
                          newOpts[idx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        placeholder={`Opción ${idx + 1} ${idx === questionForm.correctOptionIndex ? '(Correcta)' : ''}`}
                        className={`flex-1 p-2.5 rounded-xl border font-medium text-sm ${
                          idx === questionForm.correctOptionIndex
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400 font-normal">
                    Seleccioná el botón circular al lado de la opción para marcarla como la respuesta correcta.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
                  >
                    + Agregar Pregunta al Examen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL ALUMNO ---------------- */}
      {modalType === 'STUDENT' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="text-xl font-black text-slate-800">Crear Nuevo Alumno</h3>
            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs font-bold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">DNI</label>
                  <input
                    type="text"
                    required
                    value={studentForm.dni}
                    onChange={(e) => setStudentForm({ ...studentForm, dni: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Nombre de Usuario</label>
                  <input
                    type="text"
                    required
                    value={studentForm.username}
                    onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Contraseña Inicial (Temporal)</label>
                  <input
                    type="text"
                    required
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Ej: Inavet2026*"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover cursor-pointer"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL RESET PASSWORD ---------------- */}
      {modalType === 'RESET_PASS' && modalData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-xl font-black text-slate-800">
              Resetear Contraseña a {modalData.firstName} {modalData.lastName}
            </h3>
            <p className="text-xs text-slate-500">
              El alumno será obligado a cambiar esta contraseña en su próximo ingreso.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva Contraseña Temporal
                </label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover text-xs cursor-pointer"
                >
                  Confirmar Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
