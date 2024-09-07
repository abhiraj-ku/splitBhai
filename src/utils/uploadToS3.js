const { s3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Create a S3 client using aws sdk
const s3Client = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY_ID,
  },
};

// Upload to AWS S3 Bucket

async function uploadToS3(filePath, fileName) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath);

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profile-images/${fileName}`,
      Body: fileContent,
      ContentType: `images/jpg`,
      ACL: "public-read",
    };

    const command = new PutObjectCommand(s3Params);

    // call the upload function using aws client
    await s3Client.send(command);

    // send url of uploaded images to frontend
    const s3ProfileImageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}
    .s3.${process.env.AWS_REGION}
    .amazonaws.com/profile-images/${fileName}`;

    // Remove this file from local
    fs.unlinkSync(filePath);

    // return the url
    return s3ProfileImageUrl;
  } catch (error) {
    console.error(`Error Uplaoding file to S3`, error);
    throw new Error(`Error uplaoding File to S3`);
  }
}

module.exports = uploadToS3;
