const { Schema, mongo, default: mongoose } = require('mongoose');

const settlementSchema = new Schema(
  {
    from: {
      type: mongoose.Schema.ObjectId,
      ref: 'Member',
      required: [true, 'Settlement must have a sender'],
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: 'Member',
      required: [true, 'Settlement must have a receiver'],
    },
    amount: {
      type: Number,
      required: [true, 'Settlement must have an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate users on find

settlementSchema.pre(/^find/, (next) => {
  this.populate({
    path: 'from to',
    select: 'name email',
  });
});

const Settlement = mongoose.model('Settlement', settlementSchema);

module.exports = Settlement;
