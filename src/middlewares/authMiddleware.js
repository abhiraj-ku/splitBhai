const JWT = require('jsonwebtoken');
const User = require('../models/userModel');

const jwtsecret = process.env.JWT_SECRET;
if (!jwtsecret) {
  throw new Error('Missing JWT token from env variable');
}
module.exports.isAuthorized = async (req, res, next) => {
  try {
    const token = req.cookie.token || (req.headers.authorization || '').replace('Bearer', '');

    // Verify if token is present or not
    if (!token) {
      console.log(`Missing header token`);
      throw new Error(`No token found , please login to generate`);
    }

    // verify the jwt token from cookie
    const decodeToken = JWT.verify(token, jwtsecret);

    // find and attach user object to the decoded user
    req.user = await User.findById(decodeToken._id);

    return next();
  } catch (error) {
    console.log(`Error while verifying token`);

    return next(error);
  }
};
