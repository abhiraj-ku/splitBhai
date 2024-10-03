// Barter API
/*
This is a Unique Feature (Not for humans...) for bill spliting app. Settling Bill via Barter! What are we in pre Money ERA !

How this Works?
1. Admin when creating group sets/cap a amount (max barter equivalent for money)
2. User's while joining app set their risk appetite(max barter equivalent for money)
3. While settling debts they have 2 options :   
                1. Settle via payments
                2. Settle via Barter
4.The debtor(user) asks the creditor(user) for a barter , once the creditor approves the barter, both parties aggrees mutually
5.The payments(Barter in this case ) happens and both the creditor and debtor are free from further payments issue 


Note: This is completely an Experiment Feature
*/

const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

// User & Group Models
const User = require('../models/userModel');
const groupModel = require('../models/groupModel');

// Helpers and emails services
const validateBarterPayInput = require('../helpers/validateBarterPay');
const queueBarterNotification = require('../services/emailQueueProducer');

// Redis functional imports
const redisClient = require('./redisServer');
const BarterPayment = require('../models/barterModel');
const setAsync = promisify(redisClient.set).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

async function tempUserDataRedis(barterId, debtorId, creditorId, groupId, amount, barterType) {
  try {
    const tempUserData = JSON.stringify({
      debtorId,
      creditorId,
      groupId,
      amount,
      barterType,
    });

    // set the barter data in redis with barterId as key
    await setAsync(barterId, tempUserData);

    // Set the expiration time
    const deleteAfter = process.env.TEMP_DATA_STORE || 300;
    await expireAsync(debtorId, deleteAfter);

    console.log(`Barter details saved to redis for ${deleteAfter} seconds `);
  } catch (error) {
    console.error(`Error while saving barter data to redis..`, error);
  }
}

// Debtor route
// Debtor initiates the barter option
module.exports.initiateBarterPayment = async (req, res) => {
  const { debtorId, groupId, amount, barterType } = req.body;
  const creditorId = req.user._id; // the person to whom payment is made

  // Custom validation function to valid input data -> helper/validateBarterPay.js
  const validationErrors = validateBarterPayInput(
    debtorId,
    creditorId,
    groupId,
    amount,
    barterType
  );

  if (validateInput.size > 0) {
    return res.status(400).json({ message: 'Valiation error in bPay', error: validationErrors });
  }
  try {
    if (amount > req.user.riskApetite) {
      return res.status(400).json({ message: 'Barter amount exceeds your risk apetite' });
    }

    // Fetch group and creditor from the database
    const group = await groupModel.findById(groupId);
    const creditor = await User.findById(creditorId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    if (!creditor) {
      return res.status(404).json({ message: 'Creditor not found.' });
    }

    if (amount > group.maxBarterAmount) {
      return res.status(400).json({
        message: "Amount exceeds group's barter cap.",
      });
    }

    // Unique id for each barter payment
    const barterId = uuidv4();

    await tempUserDataRedis(barterId, debtorId, creditorId, groupId, amount, barterType);

    // Mail the creditor to approve the payment
    const mailOptions = {
      from: `"SplitBhai Team" <backend.team@splitbhai.com>`,
      to: creditor.email,
      subject: 'New Barter Request',
      text: `You have a new barter request from ${req.user.name} for ${amount}. Barter Type: ${barterType}`,
    };
    await queueBarterNotification(mailOptions);

    res.status(201).json({ message: 'Barter request initiated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Creditor "reject","approve" the barter payment initiated
module.exports.respBarter = async (req, res) => {
  const { barterId, status } = req.body;
  const creditorId = req.user._id;

  try {
    const barterPaymentInfo = await getAsync(barterId);

    if (!barterPaymentInfo) {
      res.status(400).json({
        message: 'The barter request has expired, Please ask the debtor to initiate payment again',
      });
    }

    // Parse the data from redis ttl
    const { debtorId, groupId, amount, barterType } = JSON.parse(barterPaymentInfo);

    // check if the reposding creditor is the one whose id is stored in data
    if (creditorId.toString() != creditorId) {
      res.status(403).json({ message: 'You are not authorized creditor for this barter payment' });
    }

    // Check for status "approve" & "reject" one by one
    if (status == 'approve') {
      const barterPayment = await BarterPayment.create({
        debtorId,
        debtorId,
        groupId,
        amount,
        barterType,
        status: 'approved',
      });

      await barterPayment.save();

      return res
        .status(200)
        .json({ message: 'Barter request approved successfully', barterPayment });
    } else if (status == 'reject') {
      return res.status(200).json({ message: 'Barter request declined' });
    } else {
      return res.status(400).json({
        message: "Invalid status. Please provide 'approve' or 'reject' as status.",
      });
    }
  } catch (error) {
    console.log(`Error responsding to the barter request`, error);
    res.status(500).json({ message: 'Server error while responding to barter request.' });
  }
};
