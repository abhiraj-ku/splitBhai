const express = require('express');

const { getAllExpense } = require('../controllers/journalController');

const router = express.Router();

router.get('/expenses/:groupId', getAllExpense);
router.post('/expenses/newE', getAllExpense);

module.exports = router;
