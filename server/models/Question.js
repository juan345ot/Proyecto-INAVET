import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'El examen asociado es obligatorio'],
    },
    prompt: {
      type: String,
      required: [true, 'El enunciado de la pregunta es obligatorio'],
      trim: true,
    },
    options: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    // correctOptionIndex: Índice de la opción correcta (0, 1, 2...).
    // Solo se consulta en servidor para corregir. Nunca se envía al alumno en el examen activo.
    correctOptionIndex: {
      type: Number,
      required: [true, 'La opción correcta es obligatoria'],
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
