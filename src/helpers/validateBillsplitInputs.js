const validateBarterPayInput = (data) => {
  const errors = [];

  if (typeof data.description !== 'string' || !data.description.trim()) {
    errors.push('Description must be a non-empty string');
  }

  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number greater than 0');
  }

  if (typeof data.paidBy !== 'string' || !data.paidBy.trim()) {
    errors.push('PaidBy must be a non-empty string');
  }

  if (
    typeof data.splitType !== 'string' ||
    !['EQUAL', 'CUSTOM'].includes(data.splitType.toUpperCase())
  ) {
    errors.push('Invalid splitType; must be either "EQUAL" or "CUSTOM"');
  }

  if (!Array.isArray(data.selectedMemeber) || data.selectedMemeber.length === 0) {
    errors.push('selectedMemeber must be a non-empty array');
  } else if (new Set(data.selectedMembers).size !== data.selectedMembers.length) {
    errors.push('selectedMembers must contain unique values');
  } else if (!data.selectedMembers.every((member) => typeof member === 'string' && member.trim())) {
    errors.push('All selectedMembers entries must be non-empty strings');
  }

  // check customAmounts Objects
  if (data.splitType.toUpperCase() === 'CUSTOM') {
    if (typeof data.customAmounts !== 'object' || Array.isArray(data.customAmounts)) {
      errors.push('customAmounts must be an object');
    } else {
      for (const [member, amount] of Object.entries(data.customAmounts)) {
        if (!data.selectedMembers.includes(member)) {
          errors.push(`customAmounts contains member (${member}) not in selectedMembers`);
        }
        if (typeof amount !== 'number' || amount < 0) {
          errors.push(`Amount for ${member} in customAmounts must be a non-negative number`);
        }
      }
    }
  }
};
