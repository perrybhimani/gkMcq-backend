import mongoose, { Schema } from 'mongoose';

// const promptSchema = new Schema(
//   {
//     type: {
//       type: String,
//       enum: ['text', 'image', 'audio']
//     },
//     value: {
//       type: String
//     }
//   }
// )

const topicSchema = new Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    level: {
      type: Number,
    },
    rowNo: {
      type: Number
    },
    section: {
      type: String,
      enum: ['Kids', 'Adults']
    },
    position: {
      type: String,
      enum: ['right', 'left', 'center'],
      default: 'center'
    },
    // prompt: [promptSchema],
    totalQuestion: {
      type: Number,
      default: 0
    }
  },
  { collection: 'topic' }
)

const topic = mongoose.model('topic', topicSchema);
module.exports = topic;