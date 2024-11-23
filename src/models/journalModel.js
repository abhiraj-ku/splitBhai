const { Schema } = require('mongoose');

const journalSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  decription: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const expenseSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
  description: String,
  amount: {
    type: Number,
    required: true,
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  splitBetween: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  splitType: {
    type: String,
    enum: ['equal', 'custom'],
    default: 'equal',
  },
  customAmounts: {
    type: Map,
    of: Number,
  },
  topicId: {
    type: String,
    ref: 'journalSchema',
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    enum: ['pending', 'settled'],
    default: 'pending',
  },
  settledAt: Date,
  lastModified: Date,
});

const JournalTopic = mongoose.model('JournalTopic', journalSchema);
const Expense = mongoose.model('Expense', expenseSchema);
module.exports = {
  JournalTopic,
  Expense,
};
