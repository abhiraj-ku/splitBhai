const { JournalTopic, Expense } = require('../models/journalModel');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const { default: mongoose } = require('mongoose');

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
  try {
    // if expense is present or not
    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // check if the same user is checking the expense or not (basically auth)
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not auth to update the expense' });
    }

    // Now update into db if all checks passed

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        description,
        amount: parseInt(amount),
        paidBy,
        createdBy: req.user._id,
        splitBetween: [paidFor],
        splitType: 'custom',
        customAmounts: { [paidFor]: parseFloat(amount) },
        date: new Date9(),
        topicId,
        lastModified: new Date(),
      },
      { new: true }
    )
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .populate('topicId', 'name description')
      .populate('groupId', 'name');

    return res.status(200).json({ message: 'Expense updated sucessfully', updatedExpense });
  } catch (error) {
    console.error('Error updating expense');
    return res.status(500).json({ message: 'Failed to update the expense' });
  }
};

// Delete the  expense

module.exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  // if id is valid or not
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid expense id ' });
  }

  try {
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    // check if the same user is checking the expense or not (basically auth)
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not auth to delete the expense' });
    }

    // everything ok then delete the expense
    await Expense.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error.message);
    return res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Settle expense API
// TODO: move this api to the settlement for payment using upi
module.exports.settleExpense = async (req, res) => {
  const { id } = req.params;
  // if id is valid or not
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid expense id ' });
  }

  try {
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    // check if the same user is checking the expense or not (basically auth)
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not auth to delete the expense' });
    }

    // validate the settled status
    if (expense.status === 'settled') {
      return res.status(400).json({ message: 'Expense already settled ' });
    }

    // update the expense to mark expense.status = "settled"
    // populate the field accordingly

    const updateExpense = await Expense.findByIdAndUpdate(
      id,
      {
        status: 'settled',
        settledAt: new Date(),
        lastModified: new Date(),
      },
      { new: true }
    )
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .populate('topicId', 'name description')
      .populate('groupId', 'name');

    return res.status(200).json({ message: 'Expense marked settles success', updateExpense });
  } catch (error) {
    console.error('Error settling expense:', error.message);
    return res.status(500).json({ error: 'Failed to settle expense' });
  }
};

// get all expense API

module.exports.getGroupExpenses = async (req, res) => {
  const { groupId } = req.params;
  const { topicId, showSettled } = req.query;
  try {
    // Step 1: Validate groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid groupId format' });
    }

    const query = { groupId };

    //filter by topic id
    if (topicId && topicId !== 'all') {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({ message: 'Invalid expense id' });
      }
      query.topicId = topicId;
    }

    // filter by status , if true get all expense because that is what is meant
    // else show default expenses which are pending in status
    if (showSettled === 'true') {
      delete query.status;
    } else {
      query.status = 'pending';
    }

    // fetch the expenses after applying all the filters
    const expense = await Expense.find(query)
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .populate('topicId', 'name description')
      .populate('groupId', 'name')
      .sort({ date: -1 });

    return res.status(200).json({ message: 'Succesfully fetched all expense', expense });
  } catch (error) {
    console.error('Error fetching group expenses:', error.message);
    res.status(500).json({ error: 'Failed to fetch group expenses' });
  }
};
