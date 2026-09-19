import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StudentLayout } from '../layouts/StudentLayout';
import {
  PlayCircle,
  CheckCircle,
  Lock,
  BookOpen,
  ArrowRight,
  Award,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const StudentHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiFetch('/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resData = await res.json();
        if (resData.success) {
          setData(resData.data);
        } else {
          setError(resData.message || 'Error al cargar el aula');
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Cargando tus clases...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout>
        <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-center max-w-lg mx-auto">
          <p className="font-bold">{error || 'No se pudo cargar la información'}</p>
        </div>
      </StudentLayout>
    );
  }

  const { welcomeName, totalLessons, completedLessonsCount, progressPercentage, isCourseFinished, continueWhereLeft, modules } = data;

  return (
    <StudentLayout>
      <div className="space-y-10">
        {/* Banner de Bienvenida y Progreso General */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-secondary to-[#75409c] p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-secondary/15">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <Sparkles size={14} className="text-primary" />
              <span>Campus Online de Formación</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              ¡Hola, {welcomeName}! 👋
            </h1>
            <p className="text-slate-100 text-sm md:text-base mt-2 font-medium">
              Bienvenido/a nuevamente a tu formación de Auxiliar Veterinario.
            </p>

            {/* Barra de Progreso */}
            <div className="mt-8 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                <span>Progreso de clases</span>
                <span className="text-white font-black text-sm">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-linear-to-r from-primary to-[#8de0ff] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-white mt-3 font-semibold">
                {completedLessonsCount} de {totalLessons} clases completadas
              </p>
              {totalLessons > 0 && completedLessonsCount === totalLessons && !isCourseFinished && <p className="text-xs text-white mt-2">Faltan las validaciones finales para completar el curso.</p>}
            </div>
          </div>
        </div>

        {/* Notificación de Curso Finalizado */}
        {isCourseFinished && (
          <div className="bg-emerald-800 text-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-wrap items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Award size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">🎉 ¡CURSO FINALIZADO!</h2>
              <p className="text-emerald-100 text-sm mt-1">
                Completaste con éxito todos los módulos y exámenes de la formación. ¡Felicitaciones por tu dedicación!
              </p>
            </div>
          </div>
        )}

        {/* Sección: "Continuar donde lo dejaste" */}
        {continueWhereLeft && !isCourseFinished && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-sky-700">
                  Continuar donde lo dejaste
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-800">
                  {continueWhereLeft.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {continueWhereLeft.description || 'Seguí avanzando en tu plan de estudio veterinario.'}
                </p>
              </div>

              <Link
                to={`/aula/clase/${continueWhereLeft._id}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-slate-900 font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <span>Continuar Clase</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* Estructura de Módulos y Clases */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Plan de Estudio y Clases
          </h2>

          <div className="space-y-6">
            {modules.map((mod) => (
              <div
                key={mod._id}
                className="bg-slate-100 rounded-3xl border border-slate-300/70 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Cabecera del Módulo */}
                <div className="p-4 sm:p-6 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mt-0.5">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="text-xs text-slate-500 mt-1">{mod.description}</p>
                    )}
                  </div>

                  {mod.status === 'COMPLETED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <CheckCircle size={14} /> Completado
                    </span>
                  ) : mod.status === 'LOCKED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                      <Lock size={14} /> Bloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-slate-800 text-xs font-bold border border-primary/30">
                      {mod.status === 'AVAILABLE' ? 'Disponible' : 'En curso'}
                    </span>
                  )}
                </div>

                <p className="px-4 sm:px-6 py-3 text-xs text-slate-600">Podés comenzar este módulo sin completar otros. Sus clases se realizan en secuencia.</p>
                {/* Listado de Clases */}
                <div className="divide-y divide-slate-100">
                  {mod.lessons.map((lesson) => {
                    const isLocked = lesson.status === 'LOCKED';
                    const isCompleted = lesson.status === 'COMPLETED';

                    return (
                      <div
                        key={lesson._id}
                        className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                          isLocked
                            ? 'bg-slate-50 text-slate-600 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-600'
                                : isLocked
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-primary/20 text-secondary font-black'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={20} />
                            ) : isLocked ? (
                              <Lock size={18} />
                            ) : (
                              <PlayCircle size={20} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4
                              className={`text-sm font-bold break-words ${
                                isLocked ? 'text-slate-600' : 'text-slate-800'
                              }`}
                            >
                              {lesson.title}
                            </h4>
                            <p className="text-xs mt-1 text-slate-600">{{ LOCKED: 'Bloqueada', AVAILABLE: 'Disponible', IN_PROGRESS: 'En curso', COMPLETED: 'Completada' }[lesson.status]}</p>
                            {lesson.description && (
                              <p className="text-xs text-slate-600 truncate mt-0.5">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {isLocked ? (
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                              <Lock size={12} /> Bloqueada
                            </span>
                          ) : (
                            <Link
                              to={`/aula/clase/${lesson._id}`}
                              className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all ${
                                isCompleted
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  : 'bg-secondary text-white hover:bg-secondary-hover shadow-md shadow-secondary/15'
                              }`}
                            >
                              <span>{isCompleted ? 'Repasar' : 'Ingresar'}</span>
                              <ChevronRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800">Validación final</h4>
                    <p className="text-sm text-slate-600 break-words">{mod.finalExam?.title || 'El administrador todavía no publicó la validación final.'}</p>
                  </div>
                  {mod.finalExam && (mod.finalExam.status === 'LOCKED'
                    ? <span className="text-xs font-bold text-slate-600">Bloqueada: completá todas las clases</span>
                    : <Link to={`/aula/examen/${mod.finalExam._id}`} className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold">
                        {mod.finalExam.status === 'COMPLETED' ? 'Aprobada · Ver evaluación' : 'Realizar validación final'}
                      </Link>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentHome;
