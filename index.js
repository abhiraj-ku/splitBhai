require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const connectDB = require("./db/db");

var morgan = require("morgan");

// call the db connection url
// connectDB();

// Middleware to parse json and urlEncoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTTP request logger middleware
app.use(morgan("tiny"));

//sample route to test the server
app.get("/home", (req, res) => {
  res.status(200).json({
    message: "hello visitor !",
  });
});

// user route
const userRoute = require("./routes/userRoute");

// user route middleware
app.use("/user/new", userRoute);

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
