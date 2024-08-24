const JWT = require("jsonwebtoken");

const jwtsecret = process.env.JWT_SECRET;
if (!jwtsecret) {
  throw new Error("Missing JWt token from env variable");
}

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    next("Authentication Failed");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = JWT.verify(token, jwtsecret);
    req.body.user = { userId: payload.userId };
    next();
  } catch (error) {
    return next(new Error("Auth failed"));
  }
};

module.exports = isLoggedIn;
