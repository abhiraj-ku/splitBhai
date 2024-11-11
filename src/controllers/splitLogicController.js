const validateBillSplit = require('../helpers/validateBillsplitInputs');

module.exports.splitBill = async (req, res) => {
  // Step 1. Get the bare split equal done
  const {
    description,
    amount,
    paidBy,
    splitType,
    selectedMembers,
    customAmounts,
    isPaidByIncluded,
  } = req.body;
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

const custom = (amount, paidBy, selectedMembers, customAmounts, isPaidByIncluded) => {
  let membersIndex = [...selectedMembers];

  // If paidBy should be included and isn't already in the array
  if (isPaidByIncluded && !membersIndex.includes(paidBy)) {
    membersIndex.push(paidBy);
  }
};
