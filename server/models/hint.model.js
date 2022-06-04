import mongoose, { Schema } from 'mongoose';

const infoSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['text', 'image', 'audio']
    },
    value: {
      type: String
    },
  }
)

const hintSchema = new Schema(
  {
    hintInfo: [infoSchema],
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: 'question'
    }
  },
  { collection: hint }
)

const hint = mongoose.model('hint', hintSchema);
module.exports = hint;