// Centralizador de URL base de la API.
// En desarrollo (Vite proxy): VITE_API_URL está vacío → las rutas van a /api/... (proxy local)
// En producción (Render): VITE_API_URL = https://tu-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Hace un fetch prefijando la URL base del backend.
 * @param {string} path - Ruta de la API, ej: '/api/auth/login'
 * @param {RequestInit} options - Opciones de fetch
 */
export const apiFetch = (path, options = {}) => {
  return fetch(`${BASE_URL}${path}`, options);
};
