const validateBillSplit = require('../helpers/validateBillsplitInputs');

module.exports.splitBill = async (req, res) => {
  // Step 1. Get the bare split equal done
  const { description, amount, paidBy, splitType, selectedMemeber } = req.body;
  if (!description || !amount || !paidBy || !splitType || !selectedMemeber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // type Checking
  const validateInput = validateBillSplit(req.body);
  if (!validateInput.isValid) {
    return res
      .status(400)
      .json({ message: 'Invalid input types', errors: validateBillSplit.errors });
  }

  //Bill splitting logics
  try {
    const paidUsers = [];

    // Type 1: splitType === 'EQUAL'
    if (splitType === 'EQUAL') {
      let membersInex = [...selectedMembers];

      // If paidBy should be included and isn't already in the array
      if (isPaidByIncluded && !membersInex.includes(paidBy)) {
        membersInex.push(paidBy);
      }

      // Calculate split amount
      const toEachMem = Number(amount / membersInex.length);
      const eachShare = Math.round(toEachMem * 10) / 10;

      // Show who owes what
      membersInex.forEach((mem) => {
        if (mem === paidBy) {
          console.log(`${mem} paid Rs. ${amount} and owes Rs. ${eachShare}`);
        } else {
          console.log(`${mem} has to pay Rs. ${eachShare} to ${paidBy}`);
        }
      });

      return {
        paymentType: 'EQUAL',
        totalAmount: amount,
        perPersonShare: eachShare,
        paidBy,
        participants: membersInex,
      };
    }
  } catch (error) {}
};
