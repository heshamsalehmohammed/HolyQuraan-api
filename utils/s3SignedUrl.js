const AWS = require("aws-sdk");

const EXPIRE_SECONDS = 86400; // 24 hours

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || "us-east-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.generateSignedUrl = (key) => {
  if (key.startsWith("http")) return key;
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.S3_BUCKET_NAME || "holyquraan-assets",
    Key: key,
    Expires: EXPIRE_SECONDS,
  });
};
