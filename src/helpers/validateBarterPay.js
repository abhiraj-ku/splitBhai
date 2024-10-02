const validator = require("validator");
const { isMongoId, isFloat, isEmpty } = validator;

function validateBarterPayInput(creditorID, groupID, amount, barterType) {
  const errors = new Map();

  // Validate creditor ID
  if (!isMongoId(creditorID)) {
    errors.set("creditorID", "Invalid creditor ID");
  }
  // Validate Debtor ID
  if (!isMongoId(debtorId)) {
    errors.set("debtorID", "Invalid debtor ID");
  }

  // Validate group ID
  if (!isMongoId(groupId)) {
    errors.set("groupId", "Invalid group ID");
  }

  // Validate amount
  if (!isFloat(amount.toString(), { min: 0 })) {
    errors.set("amount", "Amount must be a positive number.");
  }

  // Validate barterType
  if (isEmpty(barterType)) {
    errors.set("barterType", "Barter type is required.");
  }

  return errors;
}

module.exports = validateBarterPayInput;
