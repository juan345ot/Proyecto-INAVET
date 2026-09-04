import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        selectedOptionIndex: Number,
        isCorrect: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

examAttemptSchema.index({ studentId: 1, examId: 1 });

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);
export default ExamAttempt;
