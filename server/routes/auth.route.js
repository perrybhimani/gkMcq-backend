import express from 'express';
import auth from '../beans/auth';
import userParams from '../params/user.params.js';
import validate from 'express-validation';

const router = express.Router();

router
  .route('/adminLogin')
  /** POST auth/adminLogin - admin login */
  .post(validate(userParams.login), auth.adminLogin)

router
  .route('/signUp')
  //** POST auth/signUp - user signup */
  .post(validate(userParams.signUp), auth.signUp)

router
  .route('/login')
  //** POST auth/login - user login */
  .post(validate(userParams.login), auth.login)

module.exports = router;
