import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import httpStatus from 'http-status';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import logger from 'morgan';
import cors from 'cors';
import expressValidation from 'express-validation';
import APIError from './server/helpers/APIError';
import indexRouter from './server/routes/index';
import { app_env, applicationUrl } from './bin/www';

const app = express();

app.use("/swagger",express.static('dist'));

console.log('Swagger API running on: ' + applicationUrl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');

app.disable('etag');
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
app.set('trust proxy', 1);

app.use('/', indexRouter);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  var error = err;
  if (err instanceof expressValidation.ValidationError) {
    const unifiedErrorMessage = err.errors
      .map(error => error.messages.join('. '))
      .join(' and ');
    error = new APIError(unifiedErrorMessage, err.status, true);
  } else if (err instanceof Error && err.name != APIError.name) {
    const status = err.status || 500;
    error = new APIError(err.message, status, false, err);
  }
  return next(error);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND, true);
  return next(err);
});

// api error
app.use((err, req, res, next) => {
  let status, body;
  if (err.status) {
    status = err.status;
    const message =
      app_env !== 'development'
        ? err.isPublic && err.status != 500
          ? err.message
          : httpStatus[err.status]
        : err.message;
    body = { status: err.status, message: message };
  } else {
    status = 200;
    body = { status: 200, message: 'Success', data: err };
  }

  res.status(status).json(body);
});

module.exports = app;

