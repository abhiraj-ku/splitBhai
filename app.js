const express = require("express");
const cookieParser = require("cookie-parser");
const monogoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const connectDB = require("./src/db/db");

// App logic based routes
const userRoute = require("./src/routes/userRoute");
const groupRoute = require("./src/routes/groupRoute");

// Initialize the app
const app = express();

// Connect to the database
connectDB();

// Middleware to parse JSON and urlEncoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(monogoSanitize());

// Cookie parser middleware
app.use(cookieParser());

// HTTP request logger middleware
app.use(morgan("tiny"));

// Sample route to test the server
app.get("/home", (req, res) => {
  res.status(200).json({
    message: "hello visitor!",
  });
});

// User route middleware
app.use("/user/new", userRoute);

// Group create and join route middleware
app.use("/handle/g", groupRoute);

module.exports = app;
