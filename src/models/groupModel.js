const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxLength: [40, "Description cannot be more than 40 characters"],
  },
  groupCode: {
    type: String,
    required: true,
    unique: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },
    },
  ],
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  maxBarterAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Group", groupSchema);
