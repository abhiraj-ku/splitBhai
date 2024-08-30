const express = require("express");
const speakeasy = require("speakeasy");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/verify", (req, res) => {
  const { secret, token } = req.body;
  const verified = speakeasy.totp.verify({
    secret,
    token,
    encoding: "base32",
    window: 2,
  });
  res.json({ success: verified });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
