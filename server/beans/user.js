import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import user from '../models/user.model';
import topic from '../models/topic.model';
import submittedQues from '../models/submitQuestions.model';
import moment from 'moment';
import bcrypt from "bcrypt";
import { salt } from '../../bin/www';
// import discuss from '../models/feedback.model';
// import hint from '../models/hint.model';
// import notification from '../models/notification.model';
import mongoose from 'mongoose';
import question from '../models/question.model';

// authorize user
function authorizeUser(req, res, next) {
  if(req.user.role !== 'user') {
    throw new APIError('bad user authorization!', httpStatus.UNAUTHORIZED, true)
  }
  next()
}
//update user
async function updateUser(req, res, next) {
  try {
    let { name, email, pauseNotification, profilePicture, enableNotification } = req.body;
    let _id = req.params.userId;
    if(email) email = email.toLowerCase();

    let findUser = await user.findOne({ _id });
    if(!findUser) return next(new APIError('Invalid user id!', httpStatus.BAD_REQUEST, true))

    let updateValue = {};

    if(name) updateValue.name = name;
    if(email) updateValue.email = email;
    if(profilePicture) updateValue.profilePicture = profilePicture;
    if(enableNotification === true || enableNotification === false) updateValue.enableNotification = enableNotification;

    await user.updateOne({ _id }, updateValue);

    next('user updated successfully!');
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//submit question by user
async function submitQuestion(req, res, next) {
  try {
    let { topicId, questionId, submittedAnswer, submitDate } = req.body;

    let findQues = await submittedQues.findOne({ topicId, questionId, userId: req.user._id });

    if(findQues) {
      await submittedQues.updateOne({ userId: req.user._id, topicId, questionId }, { submittedAnswer, submitDate } );
    } else {
      await submittedQues.create({
        topicId,
        questionId,
        submittedAnswer,
        submitDate,
        userId: req.user._id
      });
  
      let findTopic = await topic.findOne({ _id: topicId }).select('totalQuestion');
  
      for(const u of req.user.userProgress) {
        if(u.topicId.toString() === topicId.toString()) {
          u.totalAnswered += 1;
          u.progress = parseFloat(((u.totalAnswered/ findTopic.totalQuestion) * 100).toFixed(2));
        }
      }
      await user.updateOne({ _id: req.user._id }, { $set: { userProgress: req.user.userProgress }});
    }

    next('question submitted successfully!')
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//get progress api by user
async function getProgress(req, res, next) {
  try {
    let progress = await user.aggregate([
      { $match: { _id: req.user._id }},
      { $project: { userProgress: 1 }},
      { $unwind: '$userProgress'},
      { $lookup: { from: 'topic', localField: 'userProgress.topicId', foreignField: '_id', as: 'topic' }},
      { $project: { userProgress: { progress: 1, topicId: 1, topicName: { $arrayElemAt: [ "$topic.name", 0 ]}, topicImage: { $arrayElemAt: [ "$topic.image", 0 ]}, topicLevelName: { $arrayElemAt: [ "$topic.levelName", 0 ]},
        topicLevel: { $arrayElemAt: [ "$topic.level", 0 ]}, topicRowNo: { $arrayElemAt: [ "$topic.rowNo", 0 ]}, topicPosition: { $arrayElemAt: [ "$topic.position", 0 ]}, totalQuestion: { $arrayElemAt: [ "$topic.totalQuestion", 0 ]} }}},
      { $group: { _id: { topicLevel: '$userProgress.topicLevel', topicRowNo: '$userProgress.topicRowNo'}, userProgress: { $push: '$userProgress' }, topicLevelName: { $max: "$userProgress.topicLevelName" }}},
      { $project: { _id: 0, topicLevel: '$_id.topicLevel', topicRowNo: '$_id.topicRowNo', userProgress: '$userProgress', topicLevelName: '$topicLevelName' }},
      { $sort: { topicRowNo: 1 }},
      { $group: { _id: { topicLevel: '$topicLevel' }, topicLevelName: { $max: "$topicLevelName" }, userProgress: { $push: '$userProgress' }}},
      { $project: { _id: 0, topicLevel: '$_id.topicLevel', topicLevelName: '$topicLevelName', userProgress: '$userProgress' }},
      { $sort: { topicLevel: 1 }}
    ])

    next(progress)
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

// get user profile 
async function getUserProfile(req, res, next) {
  try {
    let userDetails = await user.aggregate([
      { $match: { _id: req.user._id }},
      { $project: { name: 1, email: 1, enableNotification: 1, userProgress: 1 }},
      { $unwind: '$userProgress'},
      { $facet: { 
        ongoingTopics:[{ $match: { $and: [{'userProgress.progress': { $gt : 0 }}, {'userProgress.progress': { $lt: 100 }} ] }}],
        topics: [{ $match: { 'userProgress.progress': 0 }}]
      }},
      { $project: { userProgress: 
        { $cond: [ { $gt : [{ "$size": "$ongoingTopics" }, 0] }, '$ongoingTopics', '$topics' ]},
        ongoing: { $cond: [ { $gt : [{ "$size": "$ongoingTopics" }, 0] }, true, false ]} } },
      { $unwind: '$userProgress'},
      { $project: { _id: '$userProgress._id', name: '$userProgress.name', email: '$userProgress.email', enableNotification: '$userProgress.enableNotification', userProgress: '$userProgress.userProgress', ongoing: '$ongoing' }},
      { $lookup: { from: 'topic', localField: 'userProgress.topicId', foreignField: '_id', as: 'topic' }},
      { $project: { name: 1, email: 1, enableNotification: 1, userProgress : { topicName: { $arrayElemAt: [ "$topic.name", 0 ]}, 
        topicImage: { $arrayElemAt: [ "$topic.image", 0 ]}, progress: '$userProgress.progress', topicId: '$userProgress.topicId'}, ongoing: 1 }},
      { $group: { _id: { name: '$name', email: '$email', enableNotification: '$enableNotification', _id: '$_id', ongoing: '$ongoing'}, userProgress: { $push: '$userProgress' }}},
      { $project: { _id: '$_id._id', name: "$_id.name", email: "$_id.email", enableNotification: '$_id.enableNotification', userProgress: 1, ongoing: "$_id.ongoing" }}
    ])

    userDetails = userDetails.length > 0 ? userDetails[0] : {};
    next(userDetails)
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//get user learning progress
async function getLearningProgress(req, res, next) {
  try {
    let { currentDate, timePeriod } = req.query;

    let startDate = moment(currentDate).startOf(timePeriod);
    let endDate = moment(currentDate).endOf(timePeriod);

    let data = await submittedQues.aggregate([
      { $match: { userId: req.user._id, submitDate: { $gte: new Date(startDate), $lte: new Date(endDate) }}},
      { $project: { topicId: 1, questionId: 1, submitDate: 1 }},
      { $sort: { submitDate: 1 }}
    ])

    if(data && data.length === 0) return next([]);

    let day, date, progress = [];
    if(timePeriod === 'week' || timePeriod === 'month') {
      for(const d of data) {
        day = moment(d.submitDate).format('dddd');
        date = moment(d.submitDate).format('YYYY-MM-DD');
        
        let index = progress.findIndex(e => e.date === date)
        if(index >= 0) {
          progress[index].totalQuestions += 1;
        } else {
          progress.push({ day, date, totalQuestions: 1 });
        }
      }
    }

    if(timePeriod === 'year') {
      let months = await getMonthlyData(data);
      for(const [key, month] of Object.entries(months)) {
        if(month.length > 0) {
          progress.push({ totalQuestions: month.length, month: key })
        }
      }
    }

    next(progress)
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

async function getMonthlyData(data) {
  let months = { jan: [], feb: [], mar: [], apr: [], may: [], jun: [], jul: [], aug: [], sep: [], oct: [], nov: [], dec: [] };

  for(const d of data) {
    if(moment(d.submitDate).month() === 0) months.jan.push(d);
    if(moment(d.submitDate).month() === 1) months.feb.push(d);
    if(moment(d.submitDate).month() === 2) months.mar.push(d);
    if(moment(d.submitDate).month() === 3) months.apr.push(d);
    if(moment(d.submitDate).month() === 4) months.may.push(d);
    if(moment(d.submitDate).month() === 5) months.jun.push(d);
    if(moment(d.submitDate).month() === 6) months.jul.push(d);
    if(moment(d.submitDate).month() === 7) months.aug.push(d);
    if(moment(d.submitDate).month() === 8) months.sep.push(d);
    if(moment(d.submitDate).month() === 9) months.oct.push(d);
    if(moment(d.submitDate).month() === 10) months.nov.push(d);
    if(moment(d.submitDate).month() === 11) months.dec.push(d);
  }
  return months;
}

//change user password by user
async function changePassword(req, res, next) {
  try {
    let { currentPassword, newPassword } = req.body;

    let listUser = await user.findOne({ _id: req.user._id });

    const validPass = await listUser.matchPassword(currentPassword);
    if(!validPass) return next(new APIError("Incorrect Current Password!", httpStatus.BAD_REQUEST, true));

    newPassword = await bcrypt.hash(newPassword, salt);

    await user.updateOne({ _id: req.user._id }, { $set: { password: newPassword, activeSessions: [] }})

    next('Password changed successfully!')
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//get daily streak by user
async function getDailyStreak(req, res, next) {
  try {
    let { currentDate } = req.query;
    let startDate = moment(currentDate).startOf('month');
    let endDate = moment(currentDate).endOf('month');

    let data = await submittedQues.aggregate([
      { $match: { userId: req.user._id, submitDate: { $gte: new Date(startDate), $lte: new Date(endDate) }}},
      { $lookup: { from: 'topic', localField: 'topicId', foreignField: '_id', as: 'topic' }},
      { $project: { topicId: 1, submitDate: { $dateToString: { format: "%Y-%m-%d", date: "$submitDate" }}, totalQuestion: { $arrayElemAt: [ "$topic.totalQuestion", 0 ]} }},
      { $group: { _id: { topicId: '$topicId', date: '$submitDate' }, count: { $count: { } }, totalQuestion: { $max:"$totalQuestion" }}},
      { $project: { _id: '$_id.topicId', date: '$_id.date', count: 1, totalQuestion: 1, streak: { $eq: ['$totalQuestion', '$count']}}},
      { $group: { _id: { streak : '$streak' }, date : { $addToSet: '$date' }}},
      { $project: { _id: '$_id.streak', streak: '$date' }},
      { $match: { _id : true }},
      { $project: { _id: 0, streak: 1 }},
    ])

    let streak = data.length > 0 ? data[0].streak : [];

    let submitData = await submittedQues.find({ userId: req.user._id }).countDocuments();

    next({ streak, hotStreak: submitData > 0 ? true : false })
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//submit Feedback by user
async function submitFeedback(req, res, next) {
  try {
    let { comment, questionId } = req.body;

    await discuss.create({
      comment,
      questionId,
      userId: req.user._id
    })

    next('discussion submitted successfully!')
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}
//leader board data by user
async function getLeaderBoardData(req, res, next) {
  try {
    let { currentDate, timePeriod } = req.query;

    let startDate = moment(currentDate).startOf(timePeriod);
    let endDate = moment(currentDate).endOf(timePeriod);

    let data = await submittedQues.aggregate([
      { $match: { submitDate: { $gte: new Date(startDate), $lte: new Date(endDate) }}},
      { $lookup: { from: 'topic', localField: 'topicId', foreignField: '_id', as: 'topic' }},
      { $project: { topicId: 1, userId: 1, submitDate: { $dateToString: { format: "%Y-%m-%d", date: "$submitDate" } },
        totalQuestion: { $arrayElemAt: [ "$topic.totalQuestion", 0 ]}, topicLevel: { $arrayElemAt: [ "$topic.level", 0 ]} }},
      { $group: { _id: { topicId: '$topicId', userId: '$userId'}, count: { $count: { } }, totalQuestion: { $max:"$totalQuestion" }, topicLevel: { $first: '$topicLevel'} }},
      { $project: { _id: 0, topicId: '$_id.topicId', userId: '$_id.userId', count: 1, totalQuestion: 1, completeTopic: { $eq: ['$totalQuestion', '$count']}, topicLevel: 1  }},
      { $match: { completeTopic: { $eq: true }}},
      { $group: { _id: { userId: '$userId' }, completeTopic: { $count: { }}, level: { $max: '$topicLevel'} }},
      { $project: { _id: 0, userId: '$_id.userId', completeTopic: 1, level: 1 }},
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user'}},
      { $project: { userId: 1, completeTopic: 1, userName: { $arrayElemAt: [ "$user.name", 0 ]}, profilePicture: { $arrayElemAt: [ "$user.profilePicture", 0 ] }, level: 1 }}
    ])

    let totalTopics = await topic.find().countDocuments();

    let index = data.findIndex(e => e.userId.toString() === req.user._id.toString());
    if(index < 0) {
      data.push({ completeTopic: 0, level: 0, userId: req.user._id, userName: req.user.name, profilePicture: req.user.profilePicture ? req.user.profilePicture : undefined })
    }

    data.map(e => {
      e.totalTopics = totalTopics;
      e.userProgress = (e.completeTopic/totalTopics) * 100;
      if(req.user._id.toString() === e.userId.toString()) {
        e.currentUser = true;
      }
    })

    data = data.filter(e => e.userName && e.userId);
    next(data)
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

//get hint by question id by user
// async function getHintByQuestion(req, res, next) {
//   try {
//     let questionId = req.params.questionId;

//     let findHint = await hint.findOne({ questionId });
//     if(!findHint) return next(new APIError('No hint found for respective question!', httpStatus.BAD_REQUEST, true));

//     next(findHint)
//   } catch (err) {
//     console.log(err);
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//create notification
// async function createNotification(req, res, next) {
//   try {
//     let { receiverId, message } = req.body;

//     await notification.create({
//       senderId: req.user._id,
//       receiverId,
//       message
//     })

//     next('notification created successfully!')
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//list notification to user
// async function listNotification(req, res, next) {
//   try {
//     let listNoti = await notification
//     .find({ receiverId: req.user._id })
//     .select('message createdAt')
//     .sort({ createdAt: -1 });

//     listNoti = listNoti.map(e => ({ _id: e._id, message: e.message, createdAt: moment(e.createdAt).fromNow() }));

//     next(listNoti)
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//delete notification by user
// async function deleteNotification(req, res, next) {
//   try {
//     let _id = req.params.notiId;

//     let findNoti = await notification.findOne({ _id });
//     if(!findNoti) return next(new APIError('Invalid notification id!', httpStatus.BAD_REQUEST, true));

//     await notification.deleteOne({ _id });

//     next('notification deleted successfully!')
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

//save fcm token
// async function saveFcmToken(req, res, next) {
//   try {
//     let { fcmToken } = req.body;

//     await user.updateOne({ _id: req.user._id }, { $addToSet: { notificationToken : fcmToken}});

//     next('fcm token added successfully')
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

/**
 * get discussion list form questionId
 */
// async function getDiscussions(req, res, next) {
//   try {
//     let { questionId } = req.query;

//     let discussions = await discuss.aggregate([
//       { $match: { questionId: mongoose.Types.ObjectId(questionId) }},
//       { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' }},
//       { $project: { comment: 1, createdAt: 1, userName: { $arrayElemAt: [ "$user.name", 0 ]} }}
//     ])

//     next({ discussions, totalDiscuss: discussions.length })
//   } catch (err) {
//     return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
//   }
// }

/**
 * list Question by user
 */
async function getQuestionList(req, res, next) {
  try {
    let { topicId } = req.query;
    let questionIds = [];

    let findQuestions = await question.find({ topicId }).select('_id');

    let findSubmitQues = await submittedQues.find({ topicId, userId: req.user._id}).select('questionId -_id');

    for(const f of findQuestions) {
      if(findSubmitQues.every((id) => id.questionId.toString() !== f._id.toString())) {
        questionIds.push(f._id)
      }
    }

    next({ questionIds, submittedQuestion: findSubmitQues.length > 0 ? findSubmitQues.length : 0, totalQuestion: findQuestions.length > 0 ? findQuestions.length : 0 })
  } catch (err) {
    console.log(err)
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

/**
 * get level list by user
 */
async function getLevelList(req, res, next) {
  try {
    let levelList = await topic.find().select('-_id level');
    console.log(levelList)
    next()
  } catch (err) {
    console.log(err)
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}

module.exports = {
  authorizeUser,
  updateUser,
  submitQuestion,
  getProgress,
  getUserProfile,
  getLearningProgress,
  changePassword,
  getDailyStreak,
  submitFeedback,
  getLeaderBoardData,
  // getHintByQuestion,
  // createNotification,
  // listNotification,
  // deleteNotification,
  // saveFcmToken,
  // getDiscussions,
  getQuestionList,
  getLevelList
}