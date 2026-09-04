import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';
import { apiFetch } from '../lib/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      login(data.data.token, data.data.user);

      // Si debe cambiar la contraseña en su primer ingreso
      if (data.data.user.mustChangePassword) {
        navigate('/cambiar-password');
        return;
      }

      // Redirección por rol
      if (data.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/aula');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Intente nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Cabecera con Logo de INAVET */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block group mb-3">
            <img src={logo} alt="INAVET" className="h-20 md:h-24 mx-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105" />
          </a>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Aula Virtual INAVET
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Ingresá tus credenciales institucionales para acceder a tus clases
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Usuario o DNI
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-secondary hover:bg-secondary-hover text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Acceso seguro protegido por INAVET</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-xs font-bold text-secondary hover:text-primary transition-colors">
            ← Volver al sitio principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
