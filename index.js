require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
const monogoSanitize = require("express-mongo-sanitize");
const {
  pollEmailQueue,
  pollInviteQueue,
} = require("./src/services/emailQueueProcessor");

const connectDB = require("./src/db/db");

var morgan = require("morgan");

// call the db connection url
connectDB();

// Middleware to parse json and urlEncoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(monogoSanitize());

// cookie parser Middleware
app.use(cookieParser());

// HTTP request logger middleware
app.use(morgan("tiny"));

//sample route to test the server
app.get("/home", (req, res) => {
  res.status(200).json({
    message: "hello visitor !",
  });
});

// user route
const userRoute = require("./src/routes/userRoute");

// user route middleware
app.use("/user/new", userRoute);

// poll redis queues
pollEmailQueue();
pollInviteQueue();

const server = app.listen(PORT, () => {
  console.log(`server is running on the port: ${PORT}`);
});

// gracefully close the server (ctrl+c)
process.on("SIGINT", () => {
  console.log(`SIGINT signal recieved, closing the server`);

  server.close(() => {
    console.log(`Closed the HTTP server gracefully..`);
    process.exit(1);
  });
});
