import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del módulo es obligatorio'],
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
      default: 1,
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

const Module = mongoose.model('Module', moduleSchema);
export default Module;
