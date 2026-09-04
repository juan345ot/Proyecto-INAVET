import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'La clase asociada es obligatoria'],
    },
    title: {
      type: String,
      required: [true, 'El título del material es obligatorio'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX', 'IMAGE', 'LINK', 'YOUTUBE', 'TEXT'],
      required: [true, 'El tipo de material es obligatorio'],
      default: 'PDF',
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    mimeType: {
      type: String,
      trim: true,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      default: '', // Contenido de texto explicativo o apuntes de la clase
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

const Material = mongoose.model('Material', materialSchema);
export default Material;
