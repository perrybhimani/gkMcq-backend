import Joi from 'joi';

require('dotenv').config();

const envVarsSchema = Joi.object({
  PORT: Joi.number(),
  MONGODB_URL: Joi.string(),
  JWTSECRET: Joi.string(),
  EXPIRESIN: Joi.string(),
  SALT: Joi.number(),
  ADMIN_NAME: Joi.string(),
  ADMIN_EMAIL: Joi.string(),
  ADMIN_PASSWORD: Joi.string(),
  FACEBOOK_APP_ID: Joi.string(),
  FACEBOOK_APP_SECRET: Joi.string(),
  FACEBOOK_APP_CALLBACK_URL: Joi.string(),
  GOOGLE_CLIENT_ID: Joi.string(),
  GOOGLE_CLIENT_SECRET: Joi.string(),
  GOOGLE_APP_CALLBACK_URL: Joi.string(),
  APPLICATION_URL: Joi.string(),
  AWS_ACCESS_KEY: Joi.string(),
  AWS_SECRET_ACCESS_KEY: Joi.string(),
  AWS_REGION: Joi.string(),
  BUCKET_NAME: Joi.string(),
  AWS_URL: Joi.string()
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  port: envVars.PORT,
  mongoURL: envVars.MONGODB_URL,
  jwtSecret: envVars.JWTSECRET,
  expiresIn: envVars.EXPIRESIN,
  salt: envVars.SALT,
  adminName: envVars.ADMIN_NAME,
  adminEmail: envVars.ADMIN_EMAIL,
  adminPassword: envVars.ADMIN_PASSWORD,
  fbAppId: envVars.FACEBOOK_APP_ID,
  fbAppSecret: envVars.FACEBOOK_APP_SECRET,
  fbUrl: envVars.FACEBOOK_APP_CALLBACK,
  googleId: envVars.GOOGLE_CLIENT_ID,
  googleSecret: envVars.GOOGLE_CLIENT_SECRET,
  googleUrl: envVars.GOOGLE_APP_CALLBACK_URL,
  applicationUrl: envVars.APPLICATION_URL,
  accessKeyId: envVars.AWS_ACCESS_KEY,
  secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  awsRegion: envVars.AWS_REGION,
  awsUrl: envVars.AWS_URL,
  bucketName: envVars.BUCKET_NAME
};

export default config;