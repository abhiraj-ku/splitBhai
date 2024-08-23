const { promisify } = require("util");
const crypto = require("crypto");
const redisClient = require("./redisServer");
const nodemailer = require("nodemailer");

// promisify Redis function for avoiding callback hell
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

// use crypto to generate secure 6 digit code

function genSecureVerificationCode() {
  return new Promise((resolve, reject) => {
    try {
      const code = crypto.randomInt(100000, 1000000).toString();
      resolve(code);
    } catch (error) {
      reject(error);
    }
  });
}

// Store users data temp in redis for 5 min
async function storeuser(name, email) {
  const verificationCode = genSecureVerificationCode();

  try {
    const userData = JSON.stringify({
      name,
      email,
      verificationCode,
      verified: false,
    });

    await setAsync(email, userData);
    await expireAsync(email, 180);
  } catch (error) {
    console.error(`Error while saving data to redis..`, error);
  }

  return verificationCode;
}

// function to send verification code
async function sendVerificationCode(email) {
  const userData = await getAsync(email);

  if (!userData) throw new Error(`User not found..emailservice`);

  const user = JSON.parse(userData);

  // create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "Your Name <your-email@yourdomain.com>",
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  await transporter.sendMail(mailOptions);

  return user.verificationCode;
}

// function to verify the code

async function verifyCode(email, code) {
  const userData = await getAsync(email);
  if (!userData) {
    throw new Error(`User not found ..verify function emailservice`);
  }

  const user = JSON.parse(userData);

  // verify the code with user entered and mail

  if (user.verificationCode === code) {
    user.verified = true;
    await setAsync(email, JSON.stringify(user));
    await expireAsync(email, 3600);
    return true;
  }
  return false;
}

// export all three functions

module.exports = { storeuser, sendVerificationCode, verifyCode };
