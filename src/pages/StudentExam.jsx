import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StudentLayout } from '../layouts/StudentLayout';
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';

const StudentExam = () => {
  const { examId } = useParams();
  const [data, setData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/student/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resData = await res.json();
        if (resData.success) {
          setData(resData.data);
        } else {
          setError(resData.message || 'Error al cargar el examen');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, token]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (result && result.passed) return; // Si ya aprobó en esta pantalla
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data) return;

    // Verificar que respondió todas las preguntas
    const unanswered = data.questions.some((q) => selectedAnswers[q._id] === undefined);
    if (unanswered) {
      alert('Por favor respondé todas las preguntas antes de enviar la evaluación.');
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.keys(selectedAnswers).map((qId) => ({
        questionId: qId,
        selectedOptionIndex: selectedAnswers[qId],
      }));

      const res = await fetch(`/api/student/exam/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: answersArray }),
      });

      const resData = await res.json();
      if (resData.success) {
        setResult(resData.data);
      } else {
        alert(resData.message || 'Error al procesar el examen');
      }
    } catch (err) {
      alert('Error de conexión al enviar el examen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Cargando examen...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto py-12 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <p className="text-red-600 font-bold">{error || 'Examen no disponible'}</p>
          <Link to="/aula" className="inline-block text-xs font-bold text-secondary uppercase tracking-wider">
            ← Volver al Aula
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { exam, questions, attemptsCount, lastAttempt } = data;

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/aula"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-secondary transition-colors"
        >
          <ArrowLeft size={16} /> Volver a mis clases
        </Link>

        {/* Encabezado del Examen */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-secondary">
              Evaluación Online
            </span>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
              Puntaje mínimo de aprobación: {exam.passingScorePercent}%
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">{exam.title}</h1>
          {exam.description && <p className="text-sm text-slate-500">{exam.description}</p>}
        </div>

        {/* Resultado del Examen (si se acaba de enviar) */}
        {result && (
          <div
            className={`p-8 rounded-3xl border shadow-xl text-center space-y-4 ${
              result.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center">
              {result.passed ? (
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <XCircle size={36} />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black">
              {result.passed ? '¡EXAMEN APROBADO! ✅' : 'EXAMEN DESAPROBADO ❌'}
            </h2>
            <p className="text-sm font-medium">{result.message}</p>

            <div className="inline-flex items-center gap-6 py-3 px-6 bg-white/80 rounded-2xl border border-black/5 text-sm font-bold">
              <span>Aciertos: {result.score} de {result.totalQuestions}</span>
              <span>Calificación: {result.percentage}%</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {result.passed ? (
                <Link
                  to="/aula"
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
                >
                  Continuar a la siguiente clase
                </Link>
              ) : (
                <button
                  onClick={handleRetry}
                  className="w-full sm:w-auto px-8 py-3.5 bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Intentar Nuevamente (Intentos Ilimitados)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cuestionario */}
        {(!result || !result.passed) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, qIndex) => (
              <div
                key={q._id}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4"
              >
                <h3 className="text-base font-bold text-slate-800 leading-snug">
                  <span className="text-primary font-black mr-2">{qIndex + 1}.</span>
                  {q.prompt}
                </h3>

                <div className="space-y-2 pt-2">
                  {q.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[q._id] === optIdx;

                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(q._id, optIdx)}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-secondary font-bold shadow-xs'
                            : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className="text-sm">{option}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-secondary hover:bg-secondary-hover text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-secondary/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Award size={18} />
                  <span>Enviar Respuestas para Corrección</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentExam;
