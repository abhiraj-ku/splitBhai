const express = require('express');
const settlementController = require('../controllers/settlementController');

const router = express.Router();

router.post('/calculate', settlementController.calculateSettlements);
router.post('/:id/pay', settlementController.processPayment);

module.exports = router;
