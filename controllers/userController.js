const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const isDisposableEmail = require("../utils/checkDisposableEmail");

module.exports.register = async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    console.log("bhen ke laude bhag ja");
  }
  if (isDisposableEmail(email)) {
  }
};
