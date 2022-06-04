import express from 'express';
import validate from 'express-validation';
import admin, { authorizeAdmin } from '../beans/admin';
import adminParams from '../params/admin.params';
import userParams from '../params/user.params';
import multer from 'multer';
import  S3UploadService from '../services/files.service';
let storage = multer.memoryStorage();
let multipleUpload = multer({ storage: storage }).array('file');

const router = express.Router();

router 
  .route('/listUser')
  //** authorized admin user */
  .all(authorizeAdmin)
  //** GET admin/listUser - list user by admin */
  .get(admin.listUser)

router
  .route('/deleteUser/:userId')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** DELETE admin/deleteUser/:userId - delete user by admin */
  .delete(validate(adminParams.deleteUser), admin.deleteUser)

router
  .route('/createTopic')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** POST admin/createTopic - create topic by admin */
  .post(validate(adminParams.createTopic), admin.createTopic)

router
  .route('/listTopics')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** GET admin/listTopic - list topic by admin */
  .get(admin.listTopics)

router
  .route('/updateTopic/:topicId')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** PUT admin/updateTopic/:topicId - update topic by admin */
  .put(validate(adminParams.updateTopic), admin.updateTopic)

router
  .route('/deleteTopic/:topicId')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** DELETE admin/deleteTopic/:topicId - delete topic by admin */
  .delete(validate(adminParams.deleteTopic), admin.deleteTopic)

router
  .route('/createQuestion')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** POST admin/createQuestion - create question by admin */
  .post(validate(adminParams.createQuestion), admin.createQuestion)

router
  .route('/listQuestions')
  /** GET admin/listQuestion - list question by admin */
  .get(validate(adminParams.listQuestions), admin.listQuestions)

router
  .route('/updateQuestion/:questionId')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** PUT admin/updateQuestion/:questionId - update question by admin */
  .put(validate(adminParams.updateQuestion), admin.updateQuestion)

router
  .route('/deleteQuestion/:questionId')
  //** authorized admin user */
  .all(authorizeAdmin)
  /** DELETE admin/deleteQuestion/:questionId - delete question by admin */
  .delete(validate(adminParams.deleteQuestion), admin.deleteQuestion)

router
  .route('/getQuestionById/:questionId')
  /** GET admin/getQuestionById/:questionId - get question by id by admin */
  .get(validate(adminParams.getQuestionById), admin.getQuestionById)

router
  .route('/deleteFeedback/:feedbackId')
  /** authorize admin user */
  .all(authorizeAdmin)
  /** DELETE admin/deleteFeedback - delete feedback by admin */
  .delete(validate(adminParams.deleteFeedback), admin.deleteFeedback)

router
  .route('/createHint')
  /** authorize admin user */
  .all(authorizeAdmin)
  /** POST admin/createHint - create hint by admin */
  .post(validate(adminParams.createHint), admin.createHint)

router
  .route('/updateHint/:hintId')
  /** authorize admin user */
  .all(authorizeAdmin)
  /** PUT admin/updateHint - update hint by admin */
  .put(validate(adminParams.updateHint), admin.updateHint)

router
  .route('/deleteHint/:hintId')
  /** authorize admin user */
  .all(authorizeAdmin)
  /** DELETE admin/deleteHint - delete hint by admin */
  .delete(validate(adminParams.deleteHint), admin.deleteHint)

router
  .route('/listHints/:questionId')
  /** authorize admin user */
  .all(authorizeAdmin)
  /** GET admin/listHints - list hint by admin */
  .get(admin.listHints)

router
  .route('/updateUser/:userId')
  /** authorize admin user */
  .all(authorizeAdmin)
  /** PUT admin/updateUser/:userId  - update user by admin */
  .put(validate(userParams.updateUser), admin.updateUserByAdmin)

router
  .route('/uploadFile')
  /** POST admin/uploadFile - upload file  */
  .post(multipleUpload, S3UploadService.fileUpload, admin.uploadFile)

router
  .route('/deleteFile')
  /** POST admin/deleteFile - delete file */
  .delete(admin.deleteFile)

module.exports = router