const express = require("express");
const router = express.Router();
const limitRoute = require("../middlewares/limiterMiddleware");
const auth = require("../middlewares/authMiddleware");
const { joinGroup } = require("../controllers/groupController");

router.post("/group/join", auth, joinGroup);

module.exports = router;
