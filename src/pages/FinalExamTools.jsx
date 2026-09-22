import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const statusNames = { PENDING: 'Pendiente', APPROVED: 'Autorizado', EXHAUSTED: 'Intentos agotados', REVOKED: 'Revocado', PASSED: 'Aprobado' };

export function FinalAuthorizations({ token }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatedAt, setUpdatedAt] = useState(null);
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true); setError('');
    try {
      const response = await apiFetch('/api/admin/final-authorizations?page=' + page, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'No se pudieron cargar las solicitudes');
      if (currentRequest !== requestId.current) return;
      setRows(data.data);
      setPagination(data.pagination || { page: 1, pages: 1, total: data.data.length });
      setUpdatedAt(new Date());
      if (data.pagination && data.pagination.page !== page) setPage(data.pagination.page);
    } catch (e) {
      if (currentRequest === requestId.current) setError(e.message);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [token, page]);
  useEffect(() => { load(); return () => { requestId.current++; }; }, [load]);
  const action = async (row, operation) => {
    if (!window.confirm(operation === 'approve' ? `¿Autorizar ${row.examId?.title} para ${row.studentId?.firstName}? Se habilitarán ${row.examId?.maxAttemptsPerAuthorization || 3} intentos.` : '¿Revocar este permiso? El alumno deberá solicitarlo nuevamente.')) return;
    setBusy(true); setError('');
    try {
      const response = await apiFetch(`/api/admin/final-authorizations/${row._id}/${operation}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo actualizar');
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <section className="rounded-3xl border border-slate-300 bg-[#d8e2ee] p-5 space-y-4" aria-busy={loading}>
    <div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold text-lg text-slate-900">Autorizaciones de exámenes finales</h3>
      <button onClick={load} disabled={loading || busy} className="inline-flex items-center gap-2 text-secondary font-bold text-sm disabled:opacity-60"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Actualizando...' : 'Actualizar solicitudes'}</button>
    </div>
    <p className="text-sm text-slate-700">Cada permiso corresponde a un alumno y un final. Renovarlo repone el cupo configurado, sin borrar intentos anteriores. Las solicitudes pendientes aparecen primero.</p>
    <p role="status" className="text-xs text-slate-700">{loading ? 'Consultando solicitudes...' : updatedAt ? `Solicitudes actualizadas a las ${updatedAt.toLocaleTimeString('es-AR')}.` : ''}</p>
    {error && <p role="alert" className="text-red-800">{error}</p>}
    {!loading && !rows.length && !error && <p className="text-sm text-slate-700">No hay solicitudes registradas.</p>}
    {rows.map(row => <article key={row._id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-sm text-slate-700">
      <h4 className="font-bold text-slate-900">{row.studentId?.firstName} {row.studentId?.lastName} · {row.examId?.title || 'Examen eliminado'}</h4>
      <p>{row.examId?.moduleId?.title || 'Módulo no disponible'} · {statusNames[row.status]}</p>
      <p>Ciclo {row.cycle} · Intentos utilizados: {row.attemptsUsed} de {row.attemptLimit}. Próxima autorización: {row.examId?.maxAttemptsPerAuthorization || 3} intentos.</p>
      <div className="flex flex-wrap gap-3">
        {row.status === 'PENDING' && <button disabled={busy || loading || !row.examId || row.studentId?.status !== 'ACTIVE'} onClick={() => action(row, 'approve')} className="bg-secondary text-white rounded-xl px-4 py-2 disabled:opacity-50">Autorizar final</button>}
        {['PENDING', 'APPROVED'].includes(row.status) && <button disabled={busy || loading} onClick={() => action(row, 'revoke')} className="bg-slate-100 text-slate-800 rounded-xl px-4 py-2 disabled:opacity-50">Revocar / rechazar</button>}
      </div>
    </article>)}
    <nav aria-label="Páginas de solicitudes" className="flex items-center justify-between gap-3">
      <button aria-label="Solicitudes anteriores" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={loading || busy || page <= 1} className="p-3 rounded-xl bg-white border border-slate-300 text-secondary disabled:opacity-40"><ChevronLeft size={20} /></button>
      <span className="text-sm font-bold text-slate-800 text-center">Página {pagination.page} de {pagination.pages}<span className="block text-xs font-normal">{pagination.total} solicitudes</span></span>
      <button aria-label="Solicitudes siguientes" onClick={() => setPage(p => p + 1)} disabled={loading || busy || page >= pagination.pages} className="p-3 rounded-xl bg-white border border-slate-300 text-secondary disabled:opacity-40"><ChevronRight size={20} /></button>
    </nav>
  </section>;
}

export function FinalQuestionBank({ examId, token, onCopied }) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSelected([]); setMessage('');
    apiFetch(`/api/admin/exams/${examId}/question-bank`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => {
      if (!d.success) throw new Error(d.message); setQuestions(d.data);
    }).catch(e => setMessage(e.message));
  }, [examId, token]);
  const copy = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await apiFetch(`/api/admin/exams/${examId}/copy-questions`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ questionIds: selected }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setMessage(`${data.data.copied} ${data.data.copied === 1 ? 'pregunta copiada' : 'preguntas copiadas'}. Las ya incorporadas no se duplican.`); setSelected([]); await onCopied();
    } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  };
  return <section className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-3 text-sm text-slate-700">
    <h4 className="font-bold text-slate-900">Reutilizar preguntas de este módulo</h4>
    <p>Elegí preguntas de sus exámenes de clase. Se copian sin modificar el original. También podés agregar preguntas nuevas debajo.</p>
    {!questions.length && <p>No hay preguntas de clase disponibles en este módulo.</p>}
    <div className="max-h-64 overflow-y-auto space-y-2">{questions.map((q, index) => <div key={q._id}>
      {(index === 0 || questions[index - 1].sourceLessonId !== q.sourceLessonId) && <h5 className="font-bold text-slate-900 pt-3 pb-2">{q.sourceLessonTitle || q.sourceExamTitle}</h5>}
      <label key={q._id} className="flex gap-3 p-3 rounded-xl bg-white border border-slate-200">
      <input type="checkbox" checked={selected.includes(q._id)} onChange={e => setSelected(s => e.target.checked ? [...s, q._id] : s.filter(id => id !== q._id))} />
      <span><strong>{q.sourceExamTitle}</strong><br />{q.prompt}</span>
    </label></div>)}</div>
    <button disabled={!selected.length || busy} onClick={copy} className="bg-secondary text-white rounded-xl px-4 py-2 disabled:opacity-50">Copiar seleccionadas ({selected.length})</button>
    {message && <p role="status">{message}</p>}
  </section>;
}
