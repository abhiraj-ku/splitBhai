const express = require('express');

const {
  getAllExpense,
  newExpense,
  updateExpense,
  deleteExpense,
  settleExpense,
  getGroupExpenses,
} = require('../controllers/journalController');
const router = express.Router();

router.use(protect); // Protect all expense routes

router.get('/:groupId', getAllExpense);
router.post('/creteNew', newExpense);

//get expense of whole group
router.get('/group/:groupId', getGroupExpenses);

// update and delete
router.route('/:id').put(updateExpense).delete(deleteExpense);

// settle the expense
router.patch('/:id/settle', settleExpense);

module.exports = router;
