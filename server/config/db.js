import mongoose from 'mongoose';

export default async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'inavet_staging', serverSelectionTimeoutMS: 15000 });
  console.log('[MongoDB] Staging conectado');
}
