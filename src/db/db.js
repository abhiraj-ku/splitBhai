const mongoose = require('mongoose');

//  Connect to MongoDB without retry logic for dev env
function connectDB() {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log(`Connected to MongoDB successfully`);
    })
    .catch((error) => {
      console.error(`Error connecting to MongoDB:`, error);
      process.exit(1);
    });
}

module.exports = connectDB;
