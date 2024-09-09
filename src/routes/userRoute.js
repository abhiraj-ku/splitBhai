const express = require("express");
const router = express.Router();
const limitRoute = require("../middlewares/limiterMiddleware");
const auth = require("../middlewares/authMiddleware");

const {
  register,
  verifyEmail,
  login,
  logout,
  handleUserChoice,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/login", limitRoute, login);
router.post("/verify", verifyEmail);
router.post("/logout", logout);

// TODO: fix verifycode is not defined
// router.post("/resend-verification", limitRoute, verifyCode);

// TODO: fix the issue in handleUserChoice controller
// router.post("/choice", auth, handleUserChoice);

module.exports = router;
