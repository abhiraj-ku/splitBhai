const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { storeuser } = require("../services/emailServices");
const verifyEmail = require("../utils/checkDisposableEmail");

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

    cons;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists !",
      });
    }

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
