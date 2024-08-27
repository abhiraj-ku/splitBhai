const express = require("express");
const router = express.Router();
const { register, verifyCode } = require("../controllers/userController");

router.post("/register", register);
router.post("/verify-mail", verifyCode);

module.exports = router;
