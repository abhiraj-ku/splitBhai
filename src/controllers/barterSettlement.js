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

// TODO: Implement the two step barter payment settlemnt
// TODO: Step 1 is to generate the barter payment by debtor
// TODO: Step 2 is to reject or approve barter settlement by debtor based on their risk appetite

const validateBarterPayInput = require("../helpers/validateBarterPay");
const groupModel = require("../models/groupModel");
const User = require("../models/userModel");
const redisClient = require("./redisServer");
const { promisify } = require("util");
const expireAsync = promisify(redisClient.expire).bind(redisClient);
const queueBarterNotification = require("../services/emailQueueProducer");

const setAsync = promisify(redisClient.set).bind(redisClient);

async function tempUserDataRedis(
  debtorId,
  creditorId,
  groupId,
  amount,
  barterType
) {
  try {
    const tempUserData = json.Stringify({
      debtorId,
      creditorId,
      groupId,
      amount,
      barterType,
      status: "pending",
    });

    await setAsync("tempData", tempUserData);
    const deleteAfter = process.env.TEMP_DATA_STORE || 300;
    await expireAsync(debtorId, 300);
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

  const validationErrors = validateBarterPayInput(
    debtorId,
    creditorId,
    groupId,
    amount,
    barterType
  );

  if (validateInput.size > 0) {
    return res
      .status(400)
      .json({ message: "Valiation error in bPay", error: validationErrors });
  }
  try {
    if (amount > req.user.riskApetite) {
      return res
        .status(400)
        .json({ message: "Barter amount exceeds your risk apetite" });
    }

    // Fetch group and creditor from the database
    const group = await groupModel.findById(groupId);
    const creditor = await User.findById(creditorId);

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    if (!creditor) {
      return res.status(404).json({ message: "Creditor not found." });
    }

    if (amount > group.maxBarterAmount) {
      return res.status(400).json({
        message: "Amount exceeds group's barter cap.",
      });
    }
    // Mail the creditor to approve the payment
    const mailOptions = {
      from: `"SplitBhai Team" <backend.team@splitbhai.com>`,
      to: creditor.email,
      subject: "New Barter Request",
      text: `You have a new barter request from ${req.user.name} for ${amount}. Barter Type: ${barterType}`,
    };
    await queueBarterNotification(mailOptions);
    await tempUserDataRedis(debtorId, creditorId, groupId, amount, barterType);

    res.status(201).json({ message: "Barter request initiated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

// TODO: Creditor approval route implementation
// Creditor "reject","confirm" the barter payment initiated
module.exports.respBarter = async (req, res) => {};
