import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    // IDs de materiales marcados como vistos por el alumno en esta clase
    materialsViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    // ¿El examen de esta clase fue aprobado?
    examPassed: {
      type: Boolean,
      default: false,
    },
    // Clase completada = Materiales requeridos vistos + Examen aprobado
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar duplicar progreso del mismo alumno por clase
studentProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);
export default StudentProgress;
