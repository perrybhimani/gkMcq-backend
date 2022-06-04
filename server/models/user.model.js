import mongoose, { Schema } from 'mongoose';
import bcrypt from "bcrypt";
import { salt } from '../../bin/www';

const progressSchema = new Schema(
  {
    topicId: {
      type: mongoose.Types.ObjectId,
      ref: 'topic'
    },
    progress: {
      type: Number,
      default: 0
    },
    totalAnswered: {
      type: Number,
      default: 0
    }
  }
)

const userSchema = new Schema(
  {
    id: {
      type: String
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    activeSessions: [{
      type: String,
      default: [],
    }],
    role: {
      type: String,
      enum: ['admin', 'user']
    },
    fcmToken: {
      type: String
    },
    notificationToken: [
      {
        type: String
      }
    ],
    pauseNotification: {
      type: Boolean,
      default: false
    },
    userProgress: [progressSchema]
  }
)

userSchema.pre("save", async function (next) {
  const user = this;
  if(user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});
  
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const user = mongoose.model('user', userSchema);
module.exports = user;