const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { storeuser, verifyCode, sendVerificationCode } = require('../services/emailServices');
const { verifyEmail, verifyPhone } = require('../utils/isContactsValid');
const cookieToken = require('../utils/cookieToken');
const generateUserProfileImage = require('../utils/ generateUserProfileImage');
const { validateUsersChoice } = require('../helpers/validateUserChoice');
const queueEmailSending = require('../services/emailQueueProducer');
const logger = require('../../logger');

// Register a new user
module.exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      message: 'Missing values, Please Provide all the values',
    });
  }

  // Basic Email Regex
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Invalid email format. Only Gmail addresses are allowed.',
    });
  }

  try {
    // Run email and phone verifications in parallel
    const [emailVerificationResult, phoneVerificationResult] = await Promise.all([
      verifyEmail(email),
      verifyPhone(phone),
    ]);

    // Handling the verificationResult
    if (emailVerificationResult.status != 'valid') {
      return res.status(400).json({
        message: 'Invalid or disposable email. Use valid email address',
      });
    }

    // Handling the phone verification result
    if (phoneVerificationResult.status != 'VALID_CONFIRMED') {
      return res.status(400).json({
        message: 'Invalid phone number , Please try again with another number',
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists !',
      });
    }

    // Generate verification code and save this to redis with TTL of 3 minutes
    await storeuser(name, email);

    // TODO: Fix the queue imports and how they are used

    // Queue email for sending verification code
    const emailContent = await sendVerificationCode(email);
    await queueEmailSending({
      email,
      subject: 'Email Verification',
      html: emailContent,
    });

    // Create the user
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });
    await user.save();

    const token = await user.createJwtToken();

    res.status(200).json({
      message: 'User created successfully',
      token,
      user: { name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    logger.error('Error during user registration:', error);
    res.status(500).json({
      message: 'Server error during registration. Please try again later.',
    });
  }
};

//Login Route for the system
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
    }

    // Generate and set the authentication cookie
    await cookieToken(user, res);
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
};

// verify Email route
module.exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Please provide both email and verification code.' });
  }

  try {
    const verificationResult = await verifyCode(email, code);

    // check if correct or not
    if (!verificationResult) {
      return res.status(400).json({
        message: 'Invalid verification code.',
      });
    }

    // find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // check if email is already verfied
    if (user.emailVerified) {
      return res.status(400).json({
        message: 'Email already Verified',
      });
    }
    // mark the email verified as true
    user.emailVerified = true;

    try {
      // Generate user profile  photo
      const profileImagePath = await generateUserProfileImage(user.name);

      // upload to s3
      const profileUrl = await uplaodToS3(profileImagePath, `${user.name}-profile.jpg`);

      // update the user avatar image
      user.avatar = profileUrl;
    } catch (error) {
      logger.error(`Error generating or uploading profile image:`, error);
      return res.status(500).json({
        message: 'Server error while generating profile image. Please try again.',
      });
    }

    // save the changes to db
    await user.save();

    // Generate the JWT token now
    const token = await user.createJwtToken();
    await cookieToken(user, res);

    return res.status(200).json({
      message: 'Email verified sucessfully !',
      token,
      user: {
        _id: user._id,
        Name: user.name,
        Email: user.email,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
    });

    // save
  } catch (error) {
    logger.error(`Error Verifying code:`, error);
    return res.status(500).json({
      message: 'Server error during verification. Please try again later.',
    });
  }
};

// Logout Route for the app
module.exports.logout = async (req, res) => {
  res.clearCookie('token', { httpOnly: true }).status(200).json({
    message: 'Logged out successfully',
  });
};

// Resend email verification code
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in Redis
    const userData = await getAsync(email);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = JSON.parse(userData);

    // Check if the user is already verified
    if (user.verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Store user in Redis and get a new verification code
    await storeuser(user.name, email);

    // Generate email content and queue the email for sending
    const emailContent = await sendVerificationCode(email);
    await queueEmailSending({
      email,
      subject: 'Resend Email Verification',
      html: emailContent,
    });

    return res.status(200).json({ message: 'Verification email resent successfully' });
  } catch (error) {
    logger.error('Error in resendVerificationEmail:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Take user's choice to create group or join group

module.exports.handleUserChoice = async (req, res) => {
  const { choice } = req.body;

  try {
    const validOptions = ['create', 'join'];
    const validation = validateUsersChoice(choice, validOptions);

    if (!validation.isValid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const userID = req.user.userID;
    if (!userID) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    switch (choice) {
      case 'create':
        return createGroup(req, res);
      case 'join':
        return joinGroup(req, res);

      default:
        return res.status(400).json({
          message: `Invalid user choice`,
        });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while handling user choice. Please try again later.',
    });
  }
};

// TODO: Implement the forgot password route

// TODO: Implement the update password route

// TODO: Implement the reset token route

exports.getAllMembers = handleAsync(async (req, res, next) => {
  const members = await User.find();
  res.status(200).json({ status: 'success', results: members.length, data: { members } });
});

exports.getMember = handleAsync(async (req, res, next) => {
  const member = await User.findById(req.params.id);
  if (!member) return res.status(404).json({ status: 'fail', message: 'Member not found' });

  res.status(200).json({ status: 'success', data: { member } });
});
