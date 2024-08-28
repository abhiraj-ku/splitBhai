const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { storeuser, verifyCode } = require("../services/emailServices");
const { verifyEmail, verifyPhone } = require("../utils/isContactsValid");
const cookieToken = require("../utils/cookieToken");

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

//Login Route for the system
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ message: "Email not verified. Please verify your email." });
    }

    // Generate and set the authentication cookie
    await cookieToken(user, res);
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "Server error during login. Please try again later." });
  }
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

    // save the changes to db
    await user.save();

    // Generate the JWT token now
    await cookieToken(user, res);

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

// Logout Route for the app
module.exports.logout = async (req, res) => {
  res.clearCookie("token", { httpOnly: true }).status(200).json({
    message: "Logged out successfully",
  });
};

// Resend email verification code
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in Redis
    const userData = await getAsync(email);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = JSON.parse(userData);

    // Check if the user is already verified
    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Store user in Redis and get a new verification code
    await storeuser(user.name, email);

    // Send the verification code via email
    await sendVerificationCode(email);

    return res
      .status(200)
      .json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TODO: Implement the forgot password route

// TODO: Implement the update password route

// TODO: Implement the reset token route
