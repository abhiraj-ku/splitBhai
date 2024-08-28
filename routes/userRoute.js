const express = require("express");
const router = express.Router();
const limitRoute = require("../middlewares/limiterMiddleware");

const {
  register,
  verifyCode,
  login,
  logout,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", limitRoute, login);
router.post("/verify-mail", verifyCode);
router.post("/logout", logout);
router.post("/resend-verification", limitRoute, verifyCode);

module.exports = router;
