const mongoose = require('mongoose');
const { Schema } = mongoose;

const barterPaymentsSchema = new Schema(
  {
    debtor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creditor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    barterType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    settlementdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// setBarter date
barterPaymentsSchema.pre('save', function (next) {
  if (this.status == 'approved' && !this.settlementDate) {
    this.settlementDate = Date.now();
  }
  next();
});

const BarterPayment = mongoose.model('BarterPayment', barterPaymentsSchema);

module.exports = BarterPayment;
