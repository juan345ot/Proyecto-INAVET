import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inavet_aula');
    console.log(`[MongoDB] Conectado exitosamente: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Error de conexión: ${error.message}`);
    // No matamos el proceso en desarrollo si no hay conexión para permitir probar interfaces
  }
};

export default connectDB;
