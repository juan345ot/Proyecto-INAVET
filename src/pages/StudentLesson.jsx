import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StudentLayout } from '../layouts/StudentLayout';
import {
  FileText,
  Video,
  CheckSquare,
  Square,
  ArrowLeft,
  ExternalLink,
  Award,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

const StudentLesson = () => {
  const { id } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingMaterialId, setTogglingMaterialId] = useState(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/student/lesson/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLessonData(data.data);
      } else {
        setError(data.message || 'No tenés acceso a esta clase.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const handleToggleMaterial = async (materialId) => {
    try {
      setTogglingMaterialId(materialId);
      const res = await fetch(`/api/student/lesson/${id}/material/${materialId}/toggle-view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLessonData((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            materialsViewed: data.data.materialsViewed,
            isCompleted: data.data.isCompleted,
          },
        }));
      }
    } catch (err) {
      console.error('Error al marcar material:', err);
    } finally {
      setTogglingMaterialId(null);
    }
  };

  // Ayudante para incrustar YouTube
  const getEmbedYoutubeUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Cargando contenido de la clase...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="max-w-xl mx-auto py-12 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Acceso Restringido</h2>
          <p className="text-slate-600 text-sm font-medium">{error}</p>
          <div className="pt-2">
            <Link
              to="/aula"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-white font-bold text-sm uppercase tracking-wider hover:bg-secondary-hover transition-all"
            >
              <ArrowLeft size={16} />
              <span>Volver a mis clases</span>
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { lesson, materials, examAvailable, examId, progress } = lessonData;
  const youtubeEmbed = getEmbedYoutubeUrl(lesson.videoUrl);
  const isLessonComplete = progress?.isCompleted;

  return (
    <StudentLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Navegación y Título */}
        <div className="space-y-3">
          <Link
            to="/aula"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-secondary transition-colors"
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary">
                Clase {lesson.order}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-sm text-slate-500 mt-1">{lesson.description}</p>
              )}
            </div>

            {isLessonComplete && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase tracking-wider shrink-0">
                <CheckCircle2 size={16} />
                <span>Clase Completada</span>
              </div>
            )}
          </div>
        </div>

        {/* Reproductor de Video Externo */}
        {youtubeEmbed && (
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border border-slate-800">
            <iframe
              src={youtubeEmbed}
              title={lesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Sección de Materiales y Recursos */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen size={22} className="text-secondary" />
              <span>Materiales de la Clase</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Marcá como visto cada recurso estudiado
            </span>
          </div>

          {materials.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No hay archivos adjuntos en esta clase.</p>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => {
                const isViewed = progress?.materialsViewed?.includes(mat._id);

                return (
                  <div
                    key={mat._id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isViewed
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-800'
                        : 'bg-slate-50 border-slate-200/70 text-slate-700 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isViewed ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-secondary shadow-xs'
                        }`}
                      >
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate">{mat.title}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-600">
                          {mat.type}
                        </span>
                        {mat.content && (
                          <p className="text-xs text-slate-600 mt-2 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-100">
                            {mat.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {mat.url && (
                        <a
                          href={mat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-secondary hover:border-secondary text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>Abrir</span>
                          <ExternalLink size={13} />
                        </a>
                      )}

                      <button
                        onClick={() => handleToggleMaterial(mat._id)}
                        disabled={togglingMaterialId === mat._id}
                        className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          isViewed
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        {isViewed ? (
                          <>
                            <CheckSquare size={16} />
                            <span>Visto</span>
                          </>
                        ) : (
                          <>
                            <Square size={16} />
                            <span>Marcar visto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección del Examen de la Clase */}
        {examAvailable && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-secondary">
                Evaluación de Conocimiento
              </span>
              <h3 className="text-xl font-black text-slate-800">
                Examen de la Clase {lesson.order}
              </h3>
              <p className="text-sm text-slate-500">
                Aprobá el examen con al menos 70% para desbloquear la siguiente clase del curso.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {progress?.examPassed ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} /> Aprobado
                  </span>
                  <Link
                    to={`/aula/examen/${examId}`}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Revisar o Reintentar
                  </Link>
                </div>
              ) : (
                <Link
                  to={`/aula/examen/${examId}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-secondary hover:bg-secondary-hover text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Award size={18} />
                  <span>Realizar Examen</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentLesson;
