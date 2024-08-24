const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    code: {
      type: String,
      required: true,
    },
  },
  avatar: {
    type: String, // URL to the user's profile picture
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  badges: [
    {
      type: String,
    },
  ],
  totp: {
    secret: {
      type: String,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// decrypt the password before saving using mongoose pre method
userSchema.pre("save", async () => {
  if (!this.isModified) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// for decrypting the password back

userSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);

  return isMatch;
};

// Generate jwt token
userSchema.methods.createJwtToken = function () {
  return JWT.sign({ userId: this._id }.process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = mongoose.model("User", userSchema);
