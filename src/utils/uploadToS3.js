const { s3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const profilePhotoFolder = path.join(__dirname, "../../profile_photo");

const fileName = `${username}-profile-${Date.now()}.jpg`;
