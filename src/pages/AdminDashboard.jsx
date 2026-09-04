import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  BookOpen,
  Layers,
  Award,
  LogOut,
  Plus,
  RefreshCw,
  KeyRound,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import logo from '../assets/logo.png';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('alumnos'); // 'stats' | 'alumnos' | 'modulos' | 'clases' | 'examenes'
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales y formularios
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tempPassword, setTempPassword] = useState('');

  // Formulario nuevo alumno
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    status: 'ACTIVE',
  });

  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [resStats, resStudents, resModules, resLessons, resExams] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then((r) => r.json()),
        fetch('/api/admin/students', { headers }).then((r) => r.json()),
        fetch('/api/admin/modules', { headers }).then((r) => r.json()),
        fetch('/api/admin/lessons', { headers }).then((r) => r.json()),
        fetch('/api/admin/exams', { headers }).then((r) => r.json()),
      ]);

      if (resStats.success) setStats(resStats.data);
      if (resStudents.success) setStudents(resStudents.data);
      if (resModules.success) setModules(resModules.data);
      if (resLessons.success) setLessons(resLessons.data);
      if (resExams.success) setExams(resExams.data);
    } catch (err) {
      console.error('Error cargando panel admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (data.success) {
        alert('Alumno creado con éxito');
        setShowStudentModal(false);
        setNewStudent({
          firstName: '',
          lastName: '',
          dni: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          status: 'ACTIVE',
        });
        fetchData();
      } else {
        alert(data.message || 'Error al crear alumno');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !tempPassword) return;

    try {
      const res = await fetch(`/api/admin/students/${selectedStudent._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tempPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowResetModal(false);
        setTempPassword('');
        setSelectedStudent(null);
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
      const res = await fetch(`/api/admin/students/${student._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="INAVET" className="h-12 object-contain" />
            <div>
              <span className="font-black text-primary text-lg tracking-tight">INAVET</span>
              <span className="ml-2 text-xs uppercase font-black bg-secondary/80 text-white px-2.5 py-0.5 rounded-full">
                Panel de Administración
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">
              Admin: {user?.username}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 sm:px-4 sm:py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Pestañas */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto py-3">
          {[
            { id: 'alumnos', label: 'Gestión de Alumnos', icon: Users },
            { id: 'modulos', label: 'Módulos', icon: Layers },
            { id: 'clases', label: 'Clases y Materiales', icon: BookOpen },
            { id: 'examenes', label: 'Exámenes', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-secondary text-white shadow-md shadow-secondary/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas Rápidas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Alumnos Totales</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalStudents}</p>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
                {stats.activeStudents} activos
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Clases Publicadas</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalLessons}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Exámenes Activos</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalExams}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Evaluaciones Rendidas</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalAttempts}</p>
            </div>
          </div>
        )}

        {/* PESTAÑA: ALUMNOS */}
        {activeTab === 'alumnos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Alumnos Inscriptos</h2>
                <p className="text-xs text-slate-500">
                  Creá, editá y gestioná el acceso y contraseñas de los alumnos
                </p>
              </div>

              <button
                onClick={() => setShowStudentModal(true)}
                className="px-5 py-3 rounded-2xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Nuevo Alumno</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
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
                              setSelectedStudent(st);
                              setShowResetModal(true);
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
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 italic">
                          No hay alumnos registrados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: MÓDULOS */}
        {activeTab === 'modulos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Módulos del Curso</h2>
            <div className="grid gap-4">
              {modules.map((m) => (
                <div key={m._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-secondary">Módulo {m.order}</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{m.title}</h3>
                    <p className="text-xs text-slate-500">{m.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: CLASES */}
        {activeTab === 'clases' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Clases del Curso</h2>
            <div className="space-y-3">
              {lessons.map((l) => (
                <div key={l._id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-primary uppercase">Clase {l.order}</span>
                    <h4 className="text-base font-bold text-slate-800 mt-0.5">{l.title}</h4>
                    <p className="text-xs text-slate-400">{l.description}</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
                    {l.videoUrl ? 'Con Video' : 'Sin Video'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: EXÁMENES */}
        {activeTab === 'examenes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Exámenes Configurados</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {exams.map((ex) => (
                <div key={ex._id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-secondary">
                      {ex.lessonId ? `Clase ${ex.lessonId.order}` : 'Examen'}
                    </span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      Mínimo: {ex.passingScorePercent}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{ex.title}</h3>
                  <p className="text-xs text-slate-500">{ex.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Crear Alumno */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="text-xl font-black text-slate-800">Crear Nuevo Alumno</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs font-bold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
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
                    value={newStudent.dni}
                    onChange={(e) => setNewStudent({ ...newStudent, dni: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Nombre de Usuario</label>
                  <input
                    type="text"
                    required
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Contraseña Inicial (Temporal)</label>
                  <input
                    type="text"
                    required
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    placeholder="Ej: Inavet2026*"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Contraseña */}
      {showResetModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-xl font-black text-slate-800">
              Resetear Contraseña a {selectedStudent.firstName}
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
                  onClick={() => setShowResetModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-hover text-xs"
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
