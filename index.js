require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const jwt = require("jsonwebtoken");
const connectDB = require("./db/db");
const { db } = require("./utils/disposableEmailModels");
var morgan = require("morgan");

// call the db connection url
connectDB(1, 1000)
  .then(() => {
    console.log(`connecting....`);
  })
  .catch((error) => {
    console.error(`Failed to connect to MongoDB after multiple reconnects `);
    process.exit(1);
  });

// Middleware to parse json and urlEncoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTTP request logger middleware
app.use(morgan("tiny"));

// user route
const userRoute = require("./routes/userRoute");

// user route middleware
app.use("/u/new", userRoute);

const server = app.listen(PORT, () => {
  console.log(`server is running on the port: ${PORT}`);
});

// Gracefully shutdown the server

// gracefully close the server
process.on("SIGTERM", () => {
  console.log("SIGTERM signal recieved, closing the server");

  server.close(() => {
    console.log("HTTP server closed");

    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log(`SIGINT signal recieved, closing the server`);

  server.close(() => {
    console.log(`Closed the HTTP server gracefully..`);
    process.exit(1);
  });
});
