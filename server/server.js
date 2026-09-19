import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import { seedInitialData } from './seed.js';

dotenv.config();

// Fail closed: this branch is exclusively for the isolated staging service.
if (process.env.APP_ENV !== 'staging') throw new Error('Esta rama requiere APP_ENV=staging');
const stagingUri = new URL(process.env.MONGODB_URI || 'mongodb://localhost/missing');
if (stagingUri.pathname !== '/inavet_staging' || stagingUri.searchParams.has('dbName')) {
  throw new Error('Configurar MONGODB_URI exclusivamente para /inavet_staging');
}
if (decodeURIComponent(stagingUri.username) !== 'inavet_staging') throw new Error('Se requiere el usuario limitado inavet_staging');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Falta JWT_SECRET independiente');
if (!process.env.ADMIN_PASSWORD) throw new Error('Falta ADMIN_PASSWORD de pruebas');
if (process.env.STORAGE_SECRET || process.env.STORAGE_URL || process.env.STORAGE_ENABLED !== 'false') {
  throw new Error('El almacenamiento de produccion no esta permitido en staging');
}

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',


  process.env.FRONTEND_URL, // URL del Static Site de Render
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir herramientas sin origin (Postman, curl) y orígenes autorizados
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS no permitido para: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Conexión a MongoDB
await connectDB();
// Datos de prueba se crean manualmente; no ejecutar seeds al iniciar.

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/storage', storageRoutes);

// Endpoint de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'INAVET Aula Virtual API',
  });
});

// Este servicio se despliega como API independiente.
// El frontend React se sirve desde el Static Site de Render.
app.get('/', (req, res) => {
  res.json({
    service: 'INAVET Aula Virtual API',
    health: '/api/health',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[INAVET Backend] Servidor ejecutándose en el puerto ${PORT}`);
});
