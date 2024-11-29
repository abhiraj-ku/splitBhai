const User = require('../../models/userModel');
const Settlement = require('../setModels/settlementSchema');

// TODO: Add actual payments and handlers and remove simulation
module.exports.calculateSettlemment = async (req, res) => {
  const users = await User.find();
  if (users.length === 0) return res.status(400).json({ message: 'No user found' });

  const sortedUsers = [...users].sort((a, b) => a.balance - b.balance);
  const settlements = [];

  let i = 0;
  let j = sortedUsers.length - 1;
  while (i < j) {
    const debtor = sortedUsers[i];
    const creditor = sortedUsers[j];

    if (Math.abs(debtor.balance) < 0.01 || creditor.balance < 0.01) {
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j--;
      continue;
    }

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    const settlement = await Settlement.create({
      from: debtor._id,
      to: creditor._id,
      amount,
      status: 'pending',
    });
    settlements.push(settlement);
    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j--;
  }

  await Promise.all(sortedUsers.map((user) => user.save()));
  res.status(201).json({ message: 'Settlements done', data: { settlements } });
};

// TODO: Add actual payments gateway
