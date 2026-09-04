import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Home } from 'lucide-react';
import logo from '../assets/logo.png';

export const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Institucional de INAVET */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/aula" className="flex items-center gap-3">
              <img src={logo} alt="INAVET" className="h-12 object-contain" />
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-secondary text-lg leading-tight tracking-tight">INAVET</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campus Virtual</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-2xl border border-slate-200/60">
              <UserIcon size={16} className="text-secondary" />
              <span className="text-xs font-bold text-slate-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer del Aula */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} INAVET — Instituto Nacional de Aprendizaje Veterinario. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
