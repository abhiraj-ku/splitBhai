const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { storeuser, verifyCode } = require("../services/emailServices");
const { verifyEmail, verifyPhone } = require("../utils/isContactsValid");

// Register a new user
module.exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      message: "Missing values, Please Provide all the values",
    });
  }

  // Basic Email Regex
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format. Only Gmail addresses are allowed.",
    });
  }

  try {
    const emailVerificationResult = await verifyEmail(email);

    // Handling the verificationResult
    if (emailVerificationResult.status != "valid") {
      return res.status(400).json({
        message: "Invalid or disposable email. Use valid email address",
      });
    }

    const phoneVerificationResult = await verifyPhone(phone);

    // Handling the phone verification result
    if (phoneVerificationResult.status != "VALID_CONFIRMED") {
      return res.status(400).json({
        message: "Invalid phone number , Please try again with another number",
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists !",
      });
    }

    // Generate verification code and save this to redis with TTL of 3 minutes
    await storeuser(name, email);

    // send verification code via email

    await sendVerificationCode(email);

    // Create the user
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });
    await user.save();

    password = undefined;

    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "Server error during registration. Please try again later.",
    });
  }
};

// TODO : Implement the login route
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
};

// verify Email route
module.exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ message: "Please provide both email and verification code." });
  }

  try {
    const verificationResult = await verifyCode(email, code);

    // check if correct or not
    if (!verificationResult) {
      return res.status(400).json({
        message: "Invalid verification code.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // check if email is already verfied
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email already Verified",
      });
    }
    // mark the email verified as true
    user.emailVerified = true;

    // Generate the JWT token now

    const token = await user.createJwtToken();

    // save the changes to db
    await user.save();

    return res.status(200).json({
      message: "Email verified sucessfully !",
      token,
      user: {
        _id: user._id,
        Name: user.name,
        Email: user.email,
        emailVerified: user.emailVerified,
      },
    });

    // save
  } catch (error) {
    console.error(`Error Verifying code:`, error);
    return res.status(500).json({
      message: "Server error during verification. Please try again later.",
    });
  }
};

// TODO: Implement the forgot password

// TODO: Implement the update password

// TODO: Implement the
