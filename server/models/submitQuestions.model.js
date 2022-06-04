import mongoose, { Schema } from 'mongoose';

const submitQuestions = new Schema(
  {
    topicId: {
      type: mongoose.Types.ObjectId,
      ref: 'topic'
    },
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: 'questions'
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'user'
    },
    submittedAnswer: {
      type: String
    },
    submitDate: {
      type: Date
    }
  }
)

const submitQues = mongoose.model('submittedQues', submitQuestions);
module.exports = submitQues;