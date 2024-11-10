const validateBarterPayInput = (data) => {
  const errors = [];

  if (typeof data.description !== 'string' || !data.description.trim()) {
    errors.push('Description must be a non-empty string');
  }

  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a greater than 0');
  }

  if (typeof data.paidBy !== 'string' || !data.paidBy.trim()) {
    errors.push('PaidBy must be a non-empty string');
  }

  if (
    typeof data.splitType !== 'string' ||
    !['EQUAL', 'CUSTOM'].includes(data.splitType.toUpperCase())
  ) {
    errors.push('Invalid splitType');
  }

  if (!Array.isArray(data.selectedMemeber) || data.selectedMemeber.length === 0) {
    errors.push('selectedMemeber must be a non-empty array');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
