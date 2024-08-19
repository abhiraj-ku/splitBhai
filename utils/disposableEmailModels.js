const mongoose = require("mongoose");

const disposableEmailModel = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("DisposableDomain", disposableEmailModel);
