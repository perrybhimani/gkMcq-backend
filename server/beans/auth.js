import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import user from '../models/user.model';
import jwt from 'jsonwebtoken';
import { jwtSecret, expiresIn } from '../../bin/www';
import topic from '../models/topic.model';

async function adminLogin(req, res, next) {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    let findUser = await user.findOne({ email });

    if(findUser && findUser.role === 'admin') {
      const matchPass = await findUser.matchPassword(password);
      if(!matchPass) return next(new APIError("Incorrect Password!", httpStatus.BAD_REQUEST, true));

      const token = jwt.sign({ userId: findUser._id, email }, jwtSecret, { expiresIn });

      await user.updateOne({ _id: findUser._id }, { $push: { activeSessions: { $each: [token], $slice: -5 } }});

      return next({ name: findUser.name.split(' ')[0], token });
    }else {
      return next(new APIError("You are not an admin user!", httpStatus.BAD_REQUEST, true));
    }
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true));
  }
}

async function signUp(req, res, next) {
  try {
    let { name, email, password } = req.body;
    email = email.toLowerCase();

    let alreadyExist = await user.findOne({ email });
    if(alreadyExist) {return next(new APIError('user already present', httpStatus.BAD_REQUEST, true))}

    await user.create({
      name,
      email,
      password,
      role: 'user'
    })

    alreadyExist = await user.findOne({ email });
    const token = jwt.sign({ userId: alreadyExist._id, email }, jwtSecret, { expiresIn });

    //adding topic in userProgress
    let topics = await topic.find().select('id');
    let progress = topics.map(e => ({ topicId: e._id }));

    await user.updateOne({ _id: alreadyExist._id }, { $set: { userProgress: progress }, $push: { activeSessions: { $each: [token], $slice: -5 } }});

    next('user has successfully signed up!')
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true));
  }
}

async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    let listUser = await user.findOne({ email });
    if(!listUser) return next(new APIError("Email or Password is not correct!", httpStatus.BAD_REQUEST, true));

    const validPass = await listUser.matchPassword(password);
    if(!validPass) return next(new APIError("Incorrect Password!", httpStatus.BAD_REQUEST, true));

    const token = jwt.sign({ userId: listUser._id, email }, jwtSecret, { expiresIn });

    await user.updateOne({ _id: listUser._id }, { $push: { activeSessions: { $each: [token], $slice: -5 } } });

    next({ name: listUser.name.split(' ')[0], token, _id: listUser._id });
  } catch (err) {
    console.log(err);
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true));
  }
}

async function authorize(req, res, next) {
  try {
    let token;
    let error;
    if (req.headers.authorization) {
      if (
        typeof req.headers.authorization !== 'string' ||
        req.headers.authorization.indexOf('Bearer ') === -1
      ) {
        error = 'bad authorization';
      } else {
        token = req.headers.authorization.split(' ')[1];
      }
    } else {
      error = 'token not provided';
    }

    if(!token && error) {
      return next(new APIError(error, httpStatus.UNAUTHORIZED, true));
    }

    return jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err || !decoded || !decoded.userId) {
        return next(new APIError('bad token', httpStatus.UNAUTHORIZED, true));
      }
      const userObj = await user.findOne({ _id: decoded.userId });
      if (!userObj)
        return next(new APIError('user not found', httpStatus.NOT_FOUND, true));
      if (!userObj.activeSessions.includes(token))
        return next(
          new APIError(
            'Session expired. you have been logged out, please log in again!',
            httpStatus.UNAUTHORIZED,
            true
          )
        );

      req.user = userObj;
      return next();
    });
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
};

module.exports = {
  adminLogin,
  signUp,
  login,
  authorize,
}