const express = require("express");
const router = express.Router;

// POST -> User's choice to get info about group creation or joining

router.post("/user/choice", userChoice);

module.exports = router;
