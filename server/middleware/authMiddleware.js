import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');

      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
      }

      if (req.user.status === 'INACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Tu cuenta está inactiva. Contactate con la administración de INAVET.',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token no válido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No estás autorizado, no hay token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: no tenés permisos para esta acción',
      });
    }
    next();
  };
};
