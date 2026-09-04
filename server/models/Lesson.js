import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'El módulo es obligatorio'],
    },
    title: {
      type: String,
      required: [true, 'El título de la clase es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      default: 1, // Orden correlativo global para el desbloqueo secuencial
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '', // Enlace de YouTube u otra plataforma externa
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

// Índice compuesto para optimizar búsquedas de orden y correlatividad
lessonSchema.index({ order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
