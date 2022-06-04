import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import { s3, bucketName, awsUrl } from "../../bin/www";
import _ from "lodash";

const { v4: uuidv4 } = require("uuid");

var S3UploadService = {};

function _checkIfFileIs(filetype, matches) {
  var uploadedFileType = filetype.substr(0, filetype.indexOf("/"));
  if (uploadedFileType.indexOf(matches) >= 0) {
    return true;
  }
  return false;
}
function getFileType(filetype) {
  if (_checkIfFileIs(filetype, "image")) {
    return "image";
  } else if (_checkIfFileIs(filetype, "video")) {
    return "video";
  } else if (_checkIfFileIs(filetype, "audio")) {
    return "audio";
  } else if (filetype === "application/pdf") {
    return "pdf";
  }
  return "file";
}

//upload file on aws
S3UploadService.fileUpload = async (req, res, next) => {
  try {
    const contentType = req.headers["content-type"];
    if(contentType !== undefined && contentType.indexOf('multipart/form-data') > -1) {
      let filesData = req.files;
      if(!req.files && req.file.length === 0) return next();

      let attachs = [];

      for(const fileObj of filesData) {
        const file = fileObj;
        const filename = file.originalname;
        const extension = filename.lastIndexOf('.') === -1 ? '' : filename.substring(filename.lastIndexOf('.') + 1, filename.length);
        const fileType = getFileType(file.mimetype);
        const size = file.size;

        let userId = 'profile';
        if (req.user) {
          userId = req.user._id;
        }
        const fileLocationOnS3 = `upload_files/${userId}/upload_${uuidv4()}${extension ? '.' + extension : ''}`;

        const params = {
          Bucket: bucketName,
          Key: fileLocationOnS3,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        let s3Response = await s3.upload(params).promise();

        const attach = {
          path: `${awsUrl}${s3Response.Key}`,
          filename: filename,
          type: fileType,
          s3Key: s3Response.key,
          s3FilePath: s3Response.Location,
          size: size,
        };
        attachs.push(attach);
      }
      req.body.file = attachs[0].path;
      return next();
    } else {
      return next();
    }
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
};

//delete file on aws
S3UploadService.deleteFile = async (file) => {
  try {
    if(file) {
      const key = file.substring(47);
      var params = { Bucket: bucketName, Key: key };
      await s3.deleteObject(params).promise();
    }
    return;
  } catch (err) {
    return next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true))
  }
}
module.exports = S3UploadService;