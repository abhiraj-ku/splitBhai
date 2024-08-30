const express = require("express");
const router = express.Router();
const limitRoute = require("../middlewares/limiterMiddleware");

const {
  register,
  verifyCode,
  login,
  logout,
  handleUserChoice,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", limitRoute, login);
router.post("/verify-mail", verifyCode);
router.post("/logout", logout);
router.post("/resend-verification", limitRoute, verifyCode);

router.post("/choice", auth, handleUserChoice);

module.exports = router;
