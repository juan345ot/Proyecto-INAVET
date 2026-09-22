import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const mongo = await MongoMemoryServer.create();
const dir = await mkdtemp(join(tmpdir(), 'inavet-index-test-'));
try {
  await mongoose.connect(mongo.getUri(), { dbName: 'index_test', autoIndex: false });
  const c = mongoose.connection.db.collection('exams');
  await c.createIndex({ lessonId: 1 }, { unique: true });
  await c.insertOne({ title: 'Conservar', lessonId: null });
  const migration = fileURLToPath(new URL('../scripts/migrations/exam-association-indexes.mjs', import.meta.url));
  const run = async (apply, suffix) => promisify(execFile)(process.execPath, [migration, ...(apply ? ['--apply'] : [])], { env: { ...process.env, MONGODB_URI: mongo.getUri('index_test'), INDEX_BACKUP_PATH: join(dir, suffix + '.json') } });
  await run(false, 'dry');
  assert.ok((await c.indexes()).some(i => i.name === 'lessonId_1'));
  await run(true, 'first'); await run(true, 'second');
  assert.equal(await c.countDocuments(), 1);
  assert.ok(!(await c.indexes()).some(i => i.name === 'lessonId_1'));
  await c.insertMany([{ title: 'Sin clase 2', lessonId: null }, { title: 'Sin clase 3', lessonId: null }]);
  const id = new mongoose.Types.ObjectId();
  await c.insertOne({ title: 'Final', lessonId: null, moduleId: id });
  await assert.rejects(c.insertOne({ title: 'Final duplicado', lessonId: null, moduleId: id }), e => e.code === 11000);
  await c.insertOne({ title: 'Clase', lessonId: id });
  await assert.rejects(c.insertOne({ title: 'Clase duplicada', lessonId: id }), e => e.code === 11000);
  console.log('PASS: legacy null index migration, dry-run, idempotency, preserved documents and both unique associations');
} finally {
  await mongoose.disconnect(); await mongo.stop();
  await rm(dir, { recursive: true, force: true }); // Only the directory created by mkdtemp above.
}
