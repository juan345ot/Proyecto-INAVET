import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedInitialData } from './seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
connectDB().then(() => {
  seedInitialData();
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'INAVET Aula Virtual API',
  });
});

// En producción, servir la build estática de Vite (SPA)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[INAVET Backend] Servidor ejecutándose en el puerto ${PORT}`);
});
