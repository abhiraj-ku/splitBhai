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
const fs = require('fs');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

// User & Group Models
const User = require('../models/userModel');
const groupModel = require('../models/groupModel');

// Helpers and emails services
const validateBarterPayInput = require('../helpers/validateBarterPay');
const queueBarterNotification = require('../services/emailQueueProducer');
const uploadMulter = require('../utils/multerConfig');

// Redis functional imports
const BarterPayment = require('../models/barterModel');
const mailOptions = require('../utils/mailOptions');

const redisClient = require('./redisServer');
const uploadToS3 = require('../utils/uploadToS3');
const setAsync = promisify(redisClient.set).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

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
  const { creditorId, groupId, amount, barterType } = req.body;
  const debtorId = req.user._id; // the person initiating the payment (debtor)

  // Custom validation function to validate input data -> helper/validateBarterPay.js
  const validationErrors = validateBarterPayInput(
    debtorId,
    creditorId,
    groupId,
    amount,
    barterType
  );

  if (validationErrors.size > 0) {
    return res.status(400).json({ message: 'Validation error in bPay', error: validationErrors });
  }
  try {
    if (amount > req.user.riskApetite) {
      return res.status(400).json({ message: 'Barter amount exceeds your risk appetite' });
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

    // save the initial barter request
    const barterRequest = await BarterPayment.create({
      barterId, // Store the UUID
      debtorId,
      creditorId,
      groupId,
      amount,
      barterType,
      agreementStatus: 'none',
      status: 'pending',
    });
    await barterRequest.save();

    // Store temp data to redis also
    await tempUserDataRedis(barterId, debtorId, creditorId, groupId, amount, barterType);

    // Mail the creditor to approve the payment
    const mailOptionsData = mailOptions({
      from: `"SplitBhai Team" <backend.team@splitbhai.com>`,
      to: creditor,
      subject: 'New Barter Request',
      text: `You have a new barter request from ${req.user.name} for ${amount}. Barter Type: ${barterType}`,
    });
    await queueBarterNotification(mailOptionsData);

    res.status(201).json({ message: 'Barter request initiated successfully.', barterId });
  } catch (error) {
    console.error('Error initiating barter payment:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Creditor "reject","approve" the barter payment initiated
module.exports.respBarter = async (req, res) => {
  const { barterId, status } = req.body;
  const creditorId = req.user._id;

  try {
    const barterPaymentInfo = await getAsync(barterId);

    if (!barterPaymentInfo) {
      return res.status(400).json({
        message: 'The barter request has expired, Please ask the debtor to initiate payment again',
      });
    }

    // Parse the data from redis ttl
    const {
      debtorId,
      groupId,
      amount,
      barterType,
      creditorId: storedCreditor,
    } = JSON.parse(barterPaymentInfo);

    // check if the reposding creditor is the one whose id is stored in data
    if (creditorId.toString() != storedCreditor.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not authorized creditor for this barter payment' });
    }

    // delete barter request from redis
    await delAsync(barterId);

    // Check for status "creditor_approved" & "reject" one by one
    if (status == 'approve') {
      let barterRequest = await BarterPayment.findOne({ barterId });
      if (!barterRequest) {
        await BarterPayment.create({
          debtorId,
          debtorId,
          groupId,
          amount,
          barterType,
          agreementStatus: 'creditor_approved',
          status: 'approved',
        });
      } else {
        barterRequest.agreementStatus = 'creditor_approved';
        await barterRequest.save();
      }

      // Delete from redis cache since it's updated into mongodb
      await delAsync(barterId);

      return res
        .status(200)
        .json({ message: 'Barter request approved successfully', barterRequest });
    } else if (status == 'reject') {
      await delAsync(barterRequest);
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

//TODO: Barter POST /api/barter/settleProof
module.exports.settlebarter = async (req, res) => {
  const debtorId = req.user._id;
  const { barterId } = req.body;

  uploadMulter.single('evidence')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'Unsupported file type', error: err.message });
    }

    if (!req.files) {
      return res.status(400).json({ message: 'please upload evidences...' });
    }

    // get the filepath and name for uploading to s3
    const evidencePath = req.file.path;
    const filename = req.file.filename;

    try {
      const s3url = await uploadToS3(evidencePath, filename, debtorId);

      // create a new settlement
      const bSettlement = await BarterPayment.create({
        barterId,
        debtorId,
        evidence: s3url,
        votes: [],
      });
      await bSettlement.save();

      fs.unlinkSync(evidencePath);

      res.status(201).json({ message: 'Evidence uploade succesfully for review..' });
    } catch (error) {
      console.error(`Error settling barter request:`, error);
      if (fs.existsSync(evidencePath)) {
        fs.unlinkSync(evidencePath);
      }
      res.status(500).json({ message: 'Server error cannot upload files...' });
    }
  });
};

//TODO: Barter POST /api/barter/vote
module.exports.voteOnBarter = async (req, res) => {
  const { barterId } = req.params;
  const vote = req.body;
  const userId = req.user._id;

  if (!['satisfactory', 'unsatisfactory'].includes(vote)) {
    return res.status(400).json({ message: 'Invalid vote. Please provide among the two options' });
  }
  try {
    const bsettlment = await BarterPayment.findOne({ barterId });
    if (!bsettlment) {
      return res.status(404).json({ message: 'Settment not found' });
    }

    // check if current user has already votes
    const existingVote = bsettlment.votes.find((v) => v.userId.toString() === userId.toString());
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this barter request.' });
    }

    // add the user's votes
    bsettlment.votes.push({ userId, vote });
    await bsettlment.save();
    return res.status(200).json({ message: 'Vote cast successfully.', barterRequest });
  } catch (error) {
    console.log(`Error while casting vote request`, error);
    res.status(500).json({ message: 'Server error while voting on barter request.' });
  }
};
