import { createHmac, timingSafeEqual } from 'node:crypto';

// Decimal MB in both UI and server. Not yet connected to production routes.
export const MAX_FILE_BYTES = 500_000_000;
export const CHUNK_BYTES = 1_000_000;
export const UPLOAD_TTL_SECONDS = 3600;
const extensions = new Set(['pdf', 'ppt', 'pptx', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'gif']);

export function validateUpload({ name, size }) {
  if (typeof name !== 'string' || !name.trim() || name.length > 240 || /[\x00-\x1f\x7f/\\]/.test(name)) {
    throw new Error('Nombre de archivo inválido');
  }
  if (!extensions.has(name.split('.').pop().toLowerCase())) throw new Error('Formato no permitido');
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES) throw new Error('El archivo debe pesar entre 1 byte y 500 MB');
  return { name, size, chunkBytes: CHUNK_BYTES, chunks: Math.ceil(size / CHUNK_BYTES) };
}

export function expectedChunkSize(size, index) {
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES ||
      !Number.isInteger(index) || index < 0 || index >= Math.ceil(size / CHUNK_BYTES)) {
    throw new Error('Fragmento inválido');
  }
  return Math.min(CHUNK_BYTES, size - index * CHUNK_BYTES);
}

function validateSecret(secret) {
  if (typeof secret !== 'string' || Buffer.byteLength(secret) < 32) throw new Error('Falta una clave de almacenamiento segura');
}

export function signServiceTicket(claims, secret, ttl = 300, now = Date.now()) {
  validateSecret(secret);
  const iat = Math.floor(now / 1000);
  const payload = Buffer.from(JSON.stringify({ ...claims, v: 1, aud: 'inavet-storage', iat, exp: iat + ttl })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

export function verifyServiceTicket(ticket, secret, now = Date.now()) {
  validateSecret(secret);
  if (typeof ticket !== 'string' || ticket.length > 4096) throw new Error('Autorización inválida');
  const parts = ticket.split('.');
  if (parts.length !== 2 || !parts.every(p => /^[A-Za-z0-9_-]+$/.test(p))) throw new Error('Autorización inválida');
  const expected = createHmac('sha256', secret).update(parts[0]).digest();
  const provided = Buffer.from(parts[1], 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) throw new Error('Firma inválida');
  const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const seconds = Math.floor(now / 1000);
  if (claims.v !== 1 || claims.aud !== 'inavet-storage' || !Number.isSafeInteger(claims.iat) || !Number.isSafeInteger(claims.exp) || claims.iat > seconds + 30 || claims.exp <= seconds || claims.exp - claims.iat > 3600) throw new Error('Autorización vencida');
  return claims;
}

// Separate storage secret; never send JWT_SECRET or SFTP credentials to the browser.
export function signUploadTicket({ uploadId, adminId, lessonId, name, size }, secret, now = Date.now()) {
  validateSecret(secret);
  validateUpload({ name, size });
  if (!/^[a-f0-9]{32}$/.test(uploadId) || !/^[a-f0-9]{24}$/.test(adminId) || !/^[a-f0-9]{24}$/.test(lessonId)) {
    throw new Error('Identificador inválido');
  }
  const iat = Math.floor(now / 1000);
  const claims = { v: 1, aud: 'inavet-storage', op: 'upload', uploadId, adminId, lessonId, name, size, iat, exp: iat + UPLOAD_TTL_SECONDS };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

export function verifyUploadTicket(ticket, secret, now = Date.now()) {
  validateSecret(secret);
  if (typeof ticket !== 'string' || ticket.length > 4096) throw new Error('Autorización inválida');
  const parts = ticket.split('.');
  if (parts.length !== 2 || !parts.every(p => /^[A-Za-z0-9_-]+$/.test(p))) throw new Error('Autorización inválida');
  const expected = createHmac('sha256', secret).update(parts[0]).digest();
  const provided = Buffer.from(parts[1], 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) throw new Error('Firma inválida');
  const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const seconds = Math.floor(now / 1000);
  if (claims.v !== 1 || claims.aud !== 'inavet-storage' || claims.op !== 'upload' ||
      !Number.isSafeInteger(claims.iat) || !Number.isSafeInteger(claims.exp) ||
      claims.iat > seconds + 30 || claims.exp <= seconds || claims.exp - claims.iat !== UPLOAD_TTL_SECONDS ||
      !/^[a-f0-9]{32}$/.test(claims.uploadId) || !/^[a-f0-9]{24}$/.test(claims.adminId) || !/^[a-f0-9]{24}$/.test(claims.lessonId)) {
    throw new Error('Autorización vencida o inválida');
  }
  validateUpload(claims);
  return claims;
}
