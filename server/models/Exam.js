import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    // Optional: final evaluation; legacy lesson associations remain unchanged.
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    maxAttemptsPerAuthorization: { type: Number, default: 3, min: 1, max: 100, validate: Number.isInteger },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'El título del examen es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    passingScorePercent: {
      type: Number,
      required: true,
      default: 70, // Porcentaje mínimo para aprobar (ej: 70%)
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ lessonId: 1 }, { name: 'unique_real_lesson', unique: true, partialFilterExpression: { lessonId: { $type: 'objectId' } } });
examSchema.index({ moduleId: 1 }, { name: 'unique_final_module', unique: true, partialFilterExpression: { moduleId: { $type: 'objectId' } } });
const Exam = mongoose.model('Exam', examSchema);
export default Exam;
