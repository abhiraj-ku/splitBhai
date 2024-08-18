const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  budget: {
    type: Number,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  polls: [
    {
      question: {
        type: String,
      },
      options: [
        {
          optionText: String,
          votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
      ],
    },
  ],
  wishlist: [
    {
      item: {
        type: String,
      },
      cost: {
        type: Number,
      },
      contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", eventSchema);
