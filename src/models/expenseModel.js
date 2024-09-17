const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  groupID: String,
  payer: String,
  description: String,
  amount: Number,
  participants: [String],
  exclude_member: [String],
  created_at: { type: Date, default: Date.now() },
});

const userBalance = new mongoose.Schema({
  userID: String,
  groupID: String,
  balance: Number,
});

module.exports.Expense = mongoose.model("Expense", expenseSchema);
module.exports.UserBalance = mongoose.model("UserBalance", userBalance);
