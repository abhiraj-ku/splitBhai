const mongoose = require("mongoose");
const { Schema } = mongoose;

const barterPaymentsSchema = new Schema(
  {
    debtor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creditor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    settlementDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// setBarter date
barterPaymentsSchema.pre("save", function (next) {
  if (this.status == "approved" && !this.settlementDate) {
    this.settlementDate = Date.now();
  }
  next();
});

const BarterPayment = mongoose.model("BarterPayment", barterPaymentsSchema);

module.exports = BarterPayment;

/*
debtor: The user who owes the amount and proposes a barter.
creditor: The user who is owed the amount and must approve the barter.
groupId: The group in which the barter payment is being made.
amount: The debt amount that the barter is being proposed for.
barterType: The type of barter (e.g., assignment, groceries) based on the amount.
status: The status of the barter proposal (pending, approved, rejected).
settlementDate: The date when the barter is settled (only set if the barter is approved).
timestamps: Auto-generated fields to track when the barter was created and last updated.

*/
