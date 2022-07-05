import express from 'express';
import user, { authorizeUser } from '../beans/user';
import userParams from '../params/user.params';
import validate from 'express-validation';

const router = express.Router();

router
  .route('/updateUser/:userId')
  //** authorized user */
  .all(authorizeUser)
  //** PUT user/updateUser */
  .put(validate(userParams.updateUser), user.updateUser)

router
  .route('/submitQuestion')
  //** authorized user */
  .all(authorizeUser)
  /** POST user/submitQuestion - submit question by user */
  .post(validate(userParams.submitQuestion), user.submitQuestion)

router
  .route('/getProgress')
  //** authorized user */
  .all(authorizeUser)
  /** GET user/getProgress - get progress by user */
  .get(user.getProgress)

router
  .route('/getUserProfile')
  //** authorized user */
  .all(authorizeUser)
  /** GET user/getUserProfile - get profile by user */
  .get(user.getUserProfile)

router
  .route('/getLearningProgress')
  //** authorize user */
  .all(authorizeUser)
  /** GET user/getLearningProgress - get learning progress by user */
  .get(validate(userParams.getLearningProgress), user.getLearningProgress)

router
  .route('/changePassword')
  //** authorize user */
  .all(authorizeUser)
  /** PUT user/changePassword - change password by user */
  .put(validate(userParams.changePassword), user.changePassword)

router
  .route('/getDailyStreak')
  //** authorize user */
  .all(authorizeUser)
  /** GET user/getDailyStreak - get daily streak by user */
  .get(validate(userParams.getDailyStreak), user.getDailyStreak)

router
  .route('/submitFeedback')
  //** authorize user */
  .all(authorizeUser)
  /** POST user/submitFeedback - submit feedback by user */
  .post(user.submitFeedback)

router
  .route('/getLeaderBoardData')
  /** authorize user */
  .all(authorizeUser)
  /** GET user/getLeaderBoardData - get leaderboard data by user */
  .get(user.getLeaderBoardData)

// router
//   .route('/getHintByQuestion/:questionId')
//   /** authorize user */
//   .all(authorizeUser)
//   /** GET user/getHintByQuestion/:questionId - get hint by question id by user */
//   .get(user.getHintByQuestion)

// router
//   .route('/createNotification')
//   /** authorize user */
//   .all(authorizeUser)
//   /** POST user/createNotification - create notification */
//   .post(user.createNotification)

// router
//   .route('/listNotification')
//   /** authorize user */
//   .all(authorizeUser)
//   /** GET user/listNotification - list notification */
//   .get(user.listNotification)

// router
//   .route('/deleteNotification/:notiId')
//   /** authorize user */
//   .all(authorizeUser)
//   /** DELETE user/deleteNotification - delete notification by user */
//   .delete(validate(userParams.deleteNotification), user.deleteNotification)

// router
//   .route('/saveFcmToken')
//   /** POST user/saveFcmToken - save fcm token by user */
//   .post(user.saveFcmToken)

// router
//   .route('/getDiscussions')
//   /**GET user/getComments - get comment for particular question */
//   .get(validate(userParams.getDiscussions), user.getDiscussions)

router
  .route('/getQuestionList')
  /**GET user/getQuestionList - get question list by user */
  .get(validate(user.getQuestionList), user.getQuestionList)

router
  .route('/getLevelList')
  /** authorize user */
  .all(authorizeUser)
  /** GET user/getLevelList - get level list by user */
  .get(user.getLevelList)

module.exports = router;
