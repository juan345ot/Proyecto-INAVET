import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'La clase asociada es obligatoria'],
      unique: true, // Cada clase tiene exactamente su propio examen
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

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
