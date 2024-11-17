const validateBillSplit = require('../helpers/validateBillsplitInputs');

module.exports.splitBill = async (req, res) => {
  const {
    description,
    amount,
    paidBy,
    splitType,
    selectedMembers,
    customAmounts,
    isPaidByIncluded,
  } = req.body;

  if (!description || !amount || !paidBy || !splitType || !selectedMembers) {
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
    let response;

    // Bill spliting logic based on splitType
    if (splitType === 'equal') {
      response = splitEqual(amount, paidBy, selectedMembers, isPaidByIncluded);
    } else if (splitType === 'custom') {
      response = splitCustom(amount, paidBy, selectedMembers, customAmounts, isPaidByIncluded);
    }

    // currently supports splitType=== 'equal' & 'custom'
    if (response) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json({ message: 'Unsupported split type' });
    }
  } catch (error) {
    console.error('Failed to split bill:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
};

// Helper function fot splitType ='equal'
const splitEqual = (amount, paidBy, selectedMembers, isPaidByIncluded) => {
  let membersIndex = [...selectedMembers];

  // If paidBy should be included and isn't already in the array
  if (isPaidByIncluded && !membersIndex.includes(paidBy)) {
    membersIndex.push(paidBy);
  }

  // share per person is equal
  const sharePerPerson = Number(amount / membersIndex.length).toFixed(2);

  // Payments description about who owes to whom

  const payments = membersIndex.map((member) => ({
    member,
    owes: member === paidBy ? 0 : sharePerPerson,
    description:
      member === paidBy ? `paid Rs. ${amount}` : `Owes Rs. ${sharePerPerson} to ${paidBy} `,
  }));

  return {
    splitType: 'equal',
    totalAmount: amount,
    perPersonShare: sharePerPerson,
    paidBy,
    selectedMembers: membersIndex,
    payments,
  };
};

// Helper function fot splitType ='custom' where
// participating members can have different payments
// amount to be paid.

const splitCustom = (amount, paidBy, selectedMembers, customAmounts, isPaidByIncluded) => {
  let membersIndex = [...selectedMembers];

  // If paidBy should be included and isn't already in the array
  if (isPaidByIncluded && !membersIndex.includes(paidBy)) {
    membersIndex.push(paidBy);
  }

  try {
    // validate the amount with customAmounts so that they
    // match with amount (should not exceed total amount or be less than total amount)

    const totalCustomAmount = Object.values(customAmounts).reduce(
      (sum, value) => sum + parseInt(value),
      0
    );

    if (totalCustomAmount < amount) {
      const amountShort = amount - totalCustomAmount;
      throw new Error(
        `Custom amounts do not fully match the total amount. Shortfall of ${amountShort} remains`
      );
    } else if (Math.abs(totalCustomAmount > amount)) {
      throw new Error(
        `The sum of custom amounts (${totalCustomAmount}) does not match the total amount (${amount}).`
      );
    }

    // Get each members money they owe from customAmounts object
    const payments = membersIndex.map((member) => {
      const thismemeberOwes = customAmounts[member] ? parseFloat(customAmounts[member]) : 0;

      // if member == paidBy & paidBy is also part of transaction reduce his spendings and
      // that is his whole reimbursement he is supposed to Get
      // example:
      /*
        Assuming amount = 100, paidBy = '1', customAmounts = { '1': 10,'2': 40, '3': 50 }, 
        and isPaidByIncluded = true:
        so paidBy total reimbursement = amount - thismemeberOwes (paidBy in this case) 
        100 -10 =90 he is supposed to get
      
      */
      if (member === paidBy) {
        return {
          Recieves: true,
          member,
          owes: thismemeberOwes.toFixed(2),
          description: `Paid Rs. ${amount} and will get ${amount - memberOwes} back`,
        };
      } else {
        return {
          member,
          owes: thismemeberOwes.toFixed(2),
          description: `Owes Rs. ${thismemeberOwes} to ${paidBy}`,
        };
      }
    });
    return {
      splitType: 'custom',
      totalAmount: amount,
      paidBy,
      selectedMembers: membersIndex,
      payments,
    };
  } catch (error) {
    throw new Error(`Failed to process custom bill split : ${error.message}`);
  }
};
