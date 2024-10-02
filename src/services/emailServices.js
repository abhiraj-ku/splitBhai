const { promisify } = require("util");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const redisClient = require("./redisServer");
const queueEmailSending = require("./emailQueueProducer");

// promisify Redis function for avoiding callback hell
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const ttlAsync = promisify(redisClient.ttl).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

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
  const verificationCode = await genSecureVerificationCode();

  try {
    const userData = JSON.stringify({
      name,
      email,
      verificationCode,
      verified: false,
    });

    await setAsync(email, userData);

    const ttl = process.env.REDIS_TTL || 300;
    await expireAsync(email, 300);

    console.log(`User details saved to redis for ${ttl} seconds `);
  } catch (error) {
    console.error(`Error while saving data to redis..`, error);
  }

  return verificationCode;
}

// function to read the html template
const readFileSync = promisify(fs.readFile);
const cachedEmailtemplate = null;

async function emailTemplate(verificationCode) {
  try {
    if (!cachedEmailtemplate) {
      cachedEmailtemplate = await readFileSync(
        path.join(__dirname, "verification-email-template.html"),
        "utf-8"
      );
    }
    const year = new Date().getFullYear();
    return cachedEmailtemplate
      .replace("{{verificationCode}}", verificationCode)
      .replace("{{year", year);
  } catch (error) {
    throw new Error(`Error reading email template: ${err.message}`);
  }
}

// function to send verification code
async function sendVerificationCode(email) {
  const userData = await getAsync(email);

  if (!userData) throw new Error(`User not found..emailservice`);

  const user = JSON.parse(userData);

  // Generate the emailTemplate before the transporter
  const html = await emailTemplate(user.verificationCode);

  const mailOptions = {
    from: "mail@abhikumar.site",
    to: email,
    subject: "Email verification code",
    html: html,
  };

  try {
    await queueEmailSending(mailOptions);
    console.log(`Verification code sent sucessfully`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw new Error("Failed to send verification email");
  }

  return user.verificationCode;
}

// function to verify the code

async function verifyCode(email, code) {
  const userData = await getAsync(email);
  if (!userData) {
    throw new Error(`User not found ..verify function emailservice`);
  }

  const user = JSON.parse(userData);

  // check if verification code is expired
  const ttlVerificationCode = await ttlAsync(email);
  if (ttlVerificationCode <= 0) {
    await delAsync(email);
    throw new Error(` Verification code expired. Please generate a new code`);
  }

  // verify the code with user entered and mail
  if (user.verificationCode === code) {
    user.verified = true;
    await setAsync(email, JSON.stringify(user));
    await expireAsync(email, 3600);
    console.log(`User ${email} verified successfully`);
    return true;
  } else {
    console.log(`Verification failed for ${email} : invalid code `);
    return false;
  }
}

// export all three functions

module.exports = {
  genSecureVerificationCode,
  storeuser,
  sendVerificationCode,
  verifyCode,
};
