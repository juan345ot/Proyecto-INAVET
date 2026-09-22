import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'EXHAUSTED', 'REVOKED', 'PASSED'], default: 'PENDING' },
  requestedAt: { type: Date, default: Date.now },
  authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorizedAt: Date,
  attemptLimit: { type: Number, default: 0 },
  attemptsUsed: { type: Number, default: 0 },
  cycle: { type: Number, default: 0 },
  history: [{ action: String, at: Date, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, cycle: Number, limit: Number }],
}, { timestamps: true });
schema.index({ studentId: 1, examId: 1 }, { unique: true });
export default mongoose.model('FinalAuthorization', schema);
