import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import user from '../models/user.model';
import topic from '../models/topic.model';
import question from '../models/question.model';
// import discuss from '../models/feedback.model';
// import hint from '../models/hint.model';
import S3UploadService from '../services/files.service';
import submittedQues from '../models/submitQuestions.model';

//authorize admin user
function authorizeAdmin(req, res, next) {
  if(req.user.role !== 'admin') {
    throw new APIError('bad admin authorization!', httpStatus.UNAUTHORIZED, true)
  }
  next()
}

//list user by admin
async function listUser(req, res, next) {
  try {
    let listUser = await user.find({ _id: { $ne: req.user._id }}).select('name email');
    
    next(listUser)
  } catch (err) {
      return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//delete user by admin
async function deleteUser(req, res, next) {
  try {
    let _id = req.params.userId;
    
    let findUser = await user.findOne({ _id });
    if(!findUser) return next(new APIError('Invalid user id!', httpStatus.BAD_REQUEST, true));

    await user.deleteOne({ _id });

    next('user deleted successfully!');
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//update user by admin
async function updateUserByAdmin(req, res, next) {
  try {
    let { name, email } = req.body;
    let _id = req.params.userId;
    email = email.toLowerCase();

    let findUser = await user.findOne({ _id });
    if(!findUser) return next(new APIError('Invalid user id', httpStatus.BAD_REQUEST, true));

    let updateValue = {};
    if(name) updateValue.name = name;
    if(email) updateValue.email = email;

    await user.updateOne({ _id }, updateValue);

    next('user successfully updated!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//create topic by admin according to level
async function createTopic(req, res, next) {
  try {
    let { name, image, level, levelName, rowNo, position, prompt } = req.body;

    let findTopic = await topic.findOne({ name, level });
    if(findTopic) return next(new APIError('the topic is already present in respective level', httpStatus.BAD_REQUEST, true));

    let findPosition = await topic.findOne({ level, rowNo, position });
    if(findPosition) return next(new APIError('change the position of respective topic', httpStatus.BAD_REQUEST, true));

    let addTopic = await topic.create({
      name,
      image,
      level,
      levelName,
      rowNo,
      position,
      prompt
    })

    //updating userProgress array
    await user.updateMany({ _id: { $ne: req.user._id }}, { $push: { userProgress: { topicId: addTopic._id } }});

    next('topic successfully created!')
  } catch (err) {
    console.log("err", err)
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//list topic by admin
async function listTopics(req, res, next) {
  try {
    let listTopic = await topic.find().sort({ level: 1, rowNo: 1 });

    next(listTopic)
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//update topic by admin 
async function updateTopic(req, res, next) {
  try {
    let { name, image, level, levelName, rowNo, position, prompt } = req.body;
    let _id = req.params.topicId;

    let findTopic = await topic.findOne({ _id });
    if(!findTopic) return next(new APIError('Invalid topic id', httpStatus.BAD_REQUEST, true));

    let searchTopic = await topic.findOne({ _id: { $ne: _id }, name, level });
    if(searchTopic) return next(new APIError('the topic is already present in respective level', httpStatus.BAD_REQUEST, true));

    let searchPosition = await topic.findOne({ _id: { $ne: _id }, level, rowNo, position });
    if(searchPosition) return next(new APIError('change the position of respective topic', httpStatus.BAD_REQUEST, true));

    let updateValue = {};
    if(name) updateValue.name = name;
    if(image) updateValue.image = image;
    if(level) updateValue.level = level;
    if(levelName) updateValue.levelName = levelName;
    if(rowNo) updateValue.rowNo = rowNo;
    if(position) updateValue.position = position;
    if(prompt) updateValue.prompt = prompt;

    await topic.updateOne({ _id }, updateValue);

    if(image && findTopic.image) await S3UploadService.deleteFile(findTopic.image);

    next('topic successfully updated!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//delete topic by admin
async function deleteTopic(req, res, next) {
  try {
    let _id = req.params.topicId;

    let findTopic = await topic.findOne({ _id });
    if(!findTopic) return next(new APIError('Invalid topic id', httpStatus.BAD_REQUEST, true));

    await topic.deleteOne({ _id });

    await user.updateMany({ _id: { $ne: req.user._id }}, { $pull: { userProgress: { topicId: _id } }});

    await S3UploadService.deleteFile(findTopic.image);

    await question.deleteMany({ topicId: _id });
    next('topic deleted successfully!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//create questions by admin according to topic
async function createQuestion(req, res, next) {
  try {
    let { title, image, audio, type, answer, options, questionTitle, composerName, topicId } = req.body;

    await question.create({
      title,
      image,
      audio,
      answer,
      type,
      options,
      questionTitle,
      composerName,
      topicId
    })

    await topic.updateOne({ _id: topicId }, { $inc: { totalQuestion: 1 } });

    let totalQuestion = await topic.findOne({ _id: topicId }).select('totalQuestion');

    let users = await user.find();
    for(const u of users) {
      for(const p of u.userProgress) {
        if(p.topicId.toString() === topicId) {
          p.progress = p.totalAnswered / totalQuestion.totalQuestion * 100;
        }
      }
      await user.updateOne({ _id: u._id }, { $set: { userProgress: u.userProgress }})
    }

    next('question created successfully!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//get list of question by admin
async function listQuestions(req, res, next) {
  try {
    let { topicId } = req.query;

    let findQuestions = await question.find({ topicId }).select('title image questionTitle composerName type hint');

    next(findQuestions)
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//update question by admin
async function updateQuestion(req, res, next) {
  try {
    let { title, image, audio, type, options, questionTitle, composerName, topicId, answer } = req.body;
    let _id = req.params.questionId;

    let findQues = await question.findOne({ _id });
    if(!findQues) return next(new APIError('Invalid question id!', httpStatus.BAD_REQUEST, true));

    let updateValue = {};
    if(title) updateValue.title = title;
    if(image) updateValue.image = image;
    if(audio) updateValue.audio = audio;
    if(type) updateValue.type = type;
    if(options) updateValue.options = options;
    if(questionTitle) updateValue.questionTitle = questionTitle;
    if(composerName) updateValue.composerName = composerName;
    if(topicId) updateValue.topicId = topicId;
    if(answer) updateValue.answer = answer;

    await question.updateOne({ _id }, updateValue);

    next('question updated successfully!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//delete question by admin
async function deleteQuestion(req, res, next) {
  try {
    let _id = req.params.questionId;

    let findQues = await question.findOne({ _id });
    if(!findQues) return next(new APIError('Invalid question id!', httpStatus.BAD_REQUEST, true));

    await question.deleteOne({ _id });

    await topic.updateOne({ _id: findQues.topicId }, { $inc: { totalQuestion: -1 } });
    let totalQuestion = await topic.findOne({ _id: findQues.topicId }).select('totalQuestion');

    let users = await user.find();
    for(const u of users) {
      let findQuestion = await submittedQues.findOne({ userId: u._id, questionId: _id });
      for(const p of u.userProgress) {
        if(p.topicId.toString() === findQues.topicId.toString()) {
          if(findQuestion) p.totalAnswered = p.totalAnswered - 1;
          p.progress = totalQuestion.totalQuestion > 0 ? p.totalAnswered / totalQuestion.totalQuestion * 100 : 0;
        }
      }
      await user.updateOne({ _id: u._id }, { $set: { userProgress: u.userProgress }})
    }

    if(findQues.image) await S3UploadService.deleteFile(findQues.image);
    if(findQues.audio) await S3UploadService.deleteFile(findQues.audio);

    // await hint.deleteOne({ questionId: _id });
    // await discuss.deleteMany({ questionId: _id });
    await submittedQues.deleteMany({ questionId: _id });

    next('question deleted successfully!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//get question by question id
async function getQuestionById(req, res, next) {
  try {
    let _id = req.params.questionId;

    let findQues = await question.findOne({ _id });
    if(!findQues) return next(new APIError('Invalid question id!', httpStatus.BAD_REQUEST, true));

    next(findQues)
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//delete feedback by admin
// async function deleteFeedback(req, res, next) {
//   try {
//     let _id = req.params.feedbackId;

//     let findFeedback = await discuss.findOne({ _id });
//     if(!findFeedback) return next(new APIError('Invalid discussion Id!', httpStatus.BAD_REQUEST, true));

//     await discuss.deleteOne({ _id });

//     next('feedback deleted successfully!');
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//create hint by admin
// async function createHint(req, res, next) {
//   try {
//     let { hintInfo, questionId } = req.body;

//     let findHint = await hint.findOne({ questionId });
//     if(findHint) return next(new APIError('hint already present', httpStatus.BAD_REQUEST, true));

//     await hint.create({
//       hintInfo,
//       questionId      
//     })
    
//     await question.updateOne({ _id: questionId }, {hint: true});

//     next('hint created successfully!')
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//update hint by admin
// async function updateHint(req, res, next) {
//   try {
//     let { hintInfo, questionId } = req.body;
//     let _id = req.params.hintId;

//     let findHint = await hint.findOne({ _id });
//     if(!findHint) return next(new APIError('Invalid hint Id!', httpStatus.BAD_REQUEST, true))

//     let updateValue = {};

//     if(hintInfo) updateValue.hintInfo = hintInfo;
//     if(questionId) updateValue.questionId = questionId;

//     await hint.updateOne({ _id }, updateValue);

//     next('hint successfully updated!')
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//delete hint by admin
// async function deleteHint(req, res, next) {
//   try {
//     let _id = req.params.hintId;

//     let findHint = await hint.findOne({ _id });
//     if(!findHint) return next(new APIError('Invalid hint id!', httpStatus.BAD_REQUEST, true));

//     await hint.deleteOne({ _id });
//     await question.updateOne({ _id: findHint.questionId }, {hint: false});

//     next('hint successfully deleted!')
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//list hint by admin
// async function listHints(req, res, next) {
//   try {
//     let questionId = req.params.questionId
//     let findHint = await hint.findOne({ questionId });
//     if(!findHint) return next({});
//     next(findHint)
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//uploadFiles
async function uploadFile(req, res, next) {
  try {
    let { file } = req.body;

    next(file)
  } catch (err) {
    console.log(err)
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//deleteFile
async function deleteFile(req, res, next) {
  try {
    let { file } = req.body;

    await S3UploadService.deleteFile(file);

    next("file deleted successfully");
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

module.exports = {
  authorizeAdmin,
  listUser,
  deleteUser,
  updateUserByAdmin,
  createTopic,
  listTopics,
  updateTopic,
  deleteTopic,
  createQuestion,
  listQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
  // deleteFeedback,
  // createHint,
  // updateHint,
  // deleteHint,
  // listHints,
  uploadFile,
  deleteFile
}