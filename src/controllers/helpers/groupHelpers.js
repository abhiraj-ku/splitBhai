// Helper function to generate the invite code
const crypto = require('crypto');

const generateInviteCode = () => {
  return crypto.randomBytes(6).toString('hex');
};

// validate email helper function
const validateEmail = (email) => {
  return validator.isEmail(email) && validator.normalizeEmail(email);
};

// helper function to verify if user is admin
const isGroupAdmin = async (req, res, next) => {
  try {
    const group = await groupModel.findById(req.params.groupId);
    if (!group) {
      return res.status(400).json({ message: 'Group not found' });
    }
    const memeberRecord = group.members.find((mem) => {
      mem.user.toString() === req.user.id && m.role === 'admin';
    });
    if (!memeberRecord) {
      return res.status(403).json({ message: 'Only group admins can perform this action' });
    }
    req.group = group;
    next();
  } catch (error) {
    logger.error('Error in isGroupAdmin middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = (generateInviteCode, validateEmail);
