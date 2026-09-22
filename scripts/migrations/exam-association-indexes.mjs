// Explicit maintenance command. Never runs on application startup.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv.config({ path: process.env.MIGRATION_ENV_FILE || '.env', quiet: true });
const apply = process.argv.includes('--apply');
try {
  if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI');
  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
  const exams = mongoose.connection.db.collection('exams');
  const indexes = await exams.indexes();
  console.log(JSON.stringify({ database: mongoose.connection.name, mode: apply ? 'apply' : 'dry-run', indexes, exams: await exams.countDocuments() }));
  for (const field of ['lessonId', 'moduleId']) {
    const duplicates = await exams.aggregate([{ $match: { [field]: { $type: 'objectId' } } }, { $group: { _id: '$' + field, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]).toArray();
    if (duplicates.length) throw new Error(`Hay asociaciones duplicadas en ${field}; resolver manualmente sin borrar exámenes.`);
  }
  if (apply) {
    const backup = process.env.INDEX_BACKUP_PATH;
    if (!backup) throw new Error('Falta INDEX_BACKUP_PATH para guardar la definición anterior');
    writeFileSync(backup, JSON.stringify({ database: mongoose.connection.name, indexes, at: new Date() }, null, 2), { flag: 'wx' });
    await exams.createIndex({ lessonId: 1 }, { name: 'unique_real_lesson', unique: true, partialFilterExpression: { lessonId: { $type: 'objectId' } } });
    await exams.createIndex({ moduleId: 1 }, { name: 'unique_final_module', unique: true, partialFilterExpression: { moduleId: { $type: 'objectId' } } });
    const legacy = indexes.find(i => i.name === 'lessonId_1' && i.unique && !i.partialFilterExpression && Object.keys(i.key).length === 1 && i.key.lessonId === 1);
    if (legacy) await exams.dropIndex('lessonId_1');
    console.log(JSON.stringify({ indexes: await exams.indexes(), documentsModified: 0 }));
  }
} finally { await mongoose.disconnect(); }
