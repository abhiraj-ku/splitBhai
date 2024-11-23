const { JournalTopic, Expense } = require('../models/journalModel');
const User = require('../models/userModel');
const Group = require('../models/groupModel');

// Get all expenses controller(API)
module.exports.getAllExpense = async (req, res) => {
  const { topicId, showSettled } = req.query;
  try {
    const query = {};
    if (topicId && topicId !== 'all') query.topicId = topicId;
    if (showSettled !== true) query.status = 'pending';

    const expense = await Expense.find(query)
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .sort({ date: -1 });

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

module.exports.newExpense = async (req, res) => {
  const { description, amount, paidBy, paidFor, topicId, groupId } = req.body;
  if (!amount || !paidBy || !paidFor || !groupId) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (!mongoose.Types.ObjectId.isValid(paidBy) || !mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ error: 'Invalid paidBy or groupId format' });
  }

  if (!mongoose.Types.ObjectId.isValid(paidFor)) {
    return res.status(400).json({ error: 'Invalid paidFor format' });
  }

  if (topicId && !mongoose.Types.ObjectId.isValid(topicId)) {
    return res.status(400).json({ error: 'Invalid topicId format' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ error: 'You are not authorized to add an expense to this group' });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount: parseInt(amount),
      paidBy,
      createdBy: req.user._id,
      splitBetween: [paidFor],
      splitType: 'custom',
      customAmounts: { [paidFor]: parseFloat(amount) },
      date: new Date9(),
      topicId,
      status: 'pending',
    });

    await expense.save();

    //populate the expense
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .populate('topicId', 'name description')
      .populate('groupId', 'name');

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Error creating expense:', error.message);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

//update expense

module.exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, amount, paidBy, paidFor, topicId } = req.body;

  // Step 1: Validate Inputs
  if (!description || !amount || !paidBy || !paidFor) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(paidBy) ||
    !mongoose.Types.ObjectId.isValid(paidFor)
  ) {
    return res.status(400).json({ error: 'Invalid ID format for expense, paidBy, or paidFor' });
  }

  if (topicId && !mongoose.Types.ObjectId.isValid(topicId)) {
    return res.status(400).json({ error: 'Invalid topicId format' });
  }
};
