const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
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
  riskApetite: {
    type: Number,
    required: true,
    min: 0,
  },
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
  // Ensure `process.env.JWT_SECRET` is set correctly
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }

  try {
    // Create a JWT token
    return jwt.sign(
      { userId: this._id, email: this.email }, // Payload
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "1d" } // Token expiration
    );
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw new Error("Error generating JWT token");
  }
};

module.exports = mongoose.model("User", userSchema);
