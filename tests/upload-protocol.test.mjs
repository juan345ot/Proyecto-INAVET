import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_FILE_BYTES, CHUNK_BYTES, validateUpload, expectedChunkSize, signUploadTicket, verifyUploadTicket } from '../server/storage/uploadProtocol.js';
const secret = 'test-only-storage-secret-32-bytes-long';
const now = 1_800_000_000_000;
const request = {uploadId:'a'.repeat(32), adminId:'b'.repeat(24), lessonId:'c'.repeat(24), name:'Anatomía.pptx', size:MAX_FILE_BYTES};
test('500 MB accepted, larger files rejected', () => {
  assert.equal(validateUpload(request).chunks, 500);
  for (const size of [0, -1, 1.1, NaN, Infinity, '500', MAX_FILE_BYTES + 1]) assert.throws(() => validateUpload({...request, size}));
});
test('safe filenames and allowed extensions', () => {
  for (const name of ['../x.pdf', 'a\\x.pdf', 'x.php', 'x.pdf\u0000', '']) assert.throws(() => validateUpload({...request, name}));
  assert.equal(validateUpload({...request, name:'Clase 4.PPTX'}).size, MAX_FILE_BYTES);
});
test('exact chunk sizes and final remainder', () => {
  assert.equal(expectedChunkSize(MAX_FILE_BYTES,499),CHUNK_BYTES);
  assert.equal(expectedChunkSize(CHUNK_BYTES+3,1),3);
  for (const index of [-1,500,0.5]) assert.throws(()=>expectedChunkSize(MAX_FILE_BYTES,index));
});
test('signed ticket preserves authorization and rejects tampering', () => {
  const ticket=signUploadTicket(request,secret,now);
  assert.equal(verifyUploadTicket(ticket,secret,now).lessonId,request.lessonId);
  assert.throws(()=>verifyUploadTicket(ticket,secret+'wrong',now));
  assert.throws(()=>verifyUploadTicket(ticket,secret,now+3600_000));
  assert.throws(()=>verifyUploadTicket(ticket+'.extra',secret,now));
  assert.throws(()=>signUploadTicket(request,'short',now));
  assert.throws(()=>signUploadTicket({...request,uploadId:'../unsafe'},secret,now));
});
