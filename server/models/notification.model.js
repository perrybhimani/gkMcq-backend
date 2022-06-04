import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: 'user'
    },
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: 'user'
    },
    message: {
      type: String
    }
  },
  { timestamps: true }
)

const notification = mongoose.model('notification', notificationSchema);
module.exports = notification;