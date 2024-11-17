const mongoose = require('mongoose');
const { isLowercase, trim } = require('validator');

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [100, 'Description cannot be more than 100 characters'],
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        status: {
          type: String,
          enum: ['pending', 'active', 'inactive'],
          default: 'pending',
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        inviteCode: {
          type: String,
          required: true,
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        joinedAt: Date,
      },
    ],
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    maxBarterAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowInvites: {
        type: Boolean,
        default: true,
      },
      maxMembers: {
        type: Number,
        default: 25,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// add indexes for better performance
groupSchema.index({ groupName: 1 });
groupSchema.index({ 'members.email': 1 });
groupSchema.index({ inviteCode: 1 });

groupSchema.pre('save', (next) => {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Group', groupSchema);
