const express = require('express');
const router = express.Router();
// provides the middleware for handling multipart/form-data
// multer will be used to add a 'file' property on the req object
// that contains the image file uploaded by the form.
const multer = require('multer');
const AWS = require('aws-sdk');
const paramsConfig = require('../utils/params-config');

// creates a temporary storage container to hold the image 
// files until it is ready to be uploaded to the S3 bucket
const storage = multer.memoryStorage({
  destination: function(req, file, callback) {
    callback(null, '');
  }
});

// the image is the key.
const upload = multer({storage}).single('image');

// instantiate the service object, s3, 
// to communicate with the S3 web service

const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});

router.post('/image-upload', upload, (req, res) => {
  
  // set up params config
  const params = paramsConfig(req.file);
  
  // set up S3 service call
  s3.upload(params, (err, data) => {
    if(err) {
      console.log(err); 
      res.status(500).send(err);
    }
    res.json(data);
  });
});

module.exports = router;