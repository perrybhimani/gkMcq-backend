import mongoose, { Schema } from 'mongoose';

const promptSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['text', 'image', 'audio']
    },
    value: {
      type: String
    }
  }
)

const optionSchema = new Schema(
  {
    option: {
      type: String
    },
    prompt: [promptSchema],
    imageName: {
      type: String
    },
    correctAnswer: {
      type: Boolean
    },
    audioName: {
      type: String
    },
    matchOption: {
      type: String
    }
  }
)

const questionSchema = new Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    audio: {
      type: String,
    },
    answer: [{
      type: String,
    }],
    type: {
      type: String,
      enum: ['MCQ', 'MCQ (Audio)', 'MCQ (Image)', 'Ranking', 'Ranking (Audio)', 'Fill in the blanks', 'Tapping Rhythm', 'Mix and Match']
    },
    options: {
      type: [optionSchema],
      default: undefined
    },
    questionTitle: {
      type: String
    },
    composerName: {
      type: String
    },
    topicId: {
      type: mongoose.Types.ObjectId,
      ref: 'topics'
    },
    hint: {
      type: Boolean,
      default: false
    }
  },
  { collection: 'question'}
)

const question = mongoose.model('question', questionSchema);
module.exports = question;