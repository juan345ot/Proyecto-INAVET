import mongoose from 'mongoose';
import ExamAttempt from '../models/ExamAttempt.js';
import FinalAuthorization from '../models/FinalAuthorization.js';

// A transaction consumes the slot and saves the attempt together. Parallel submissions
// serialize on the same authorization, so they cannot exceed the granted budget.
export async function recordFinalAttempt(payload) {
  let attempt;
  let remaining;
  await mongoose.connection.transaction(async session => {
    const grant = await FinalAuthorization.findOneAndUpdate({
      studentId: payload.studentId, examId: payload.examId, status: 'APPROVED',
      $expr: { $lt: ['$attemptsUsed', '$attemptLimit'] },
    }, { $inc: { attemptsUsed: 1 } }, { session, returnDocument: 'after' });
    if (!grant || await ExamAttempt.exists({ studentId: payload.studentId, examId: payload.examId, passed: true }).session(session)) {
      const error = new Error('No quedan intentos autorizados o el final ya está aprobado. Volvé al aula para revisar tu autorización.');
      error.status = 403;
      throw error;
    }
    const count = await ExamAttempt.countDocuments({ studentId: payload.studentId, examId: payload.examId }).session(session);
    [attempt] = await ExamAttempt.create([{ ...payload, attemptNumber: count + 1, authorizationCycle: grant.cycle }], { session });
    remaining = grant.attemptLimit - grant.attemptsUsed;
    if (payload.passed || remaining === 0) {
      grant.status = payload.passed ? 'PASSED' : 'EXHAUSTED';
      await grant.save({ session });
    }
  });
  return { attempt, remaining };
}
