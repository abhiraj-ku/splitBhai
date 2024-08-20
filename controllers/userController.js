const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const wildcards = require("disposable-email-domains/wildcard.json");

// Register a new user
module.exports.register = async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    console.log("first");
  }
  if (isDisposableEmail(email)) {
  }
};
