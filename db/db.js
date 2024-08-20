const mongoose = require("mongoose");

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Retry options
const retryOptions = {
  maxAttempt: 5,
  interval: 1000,
  maxInterval: 10000,
  factor: 2,
};

// Connect to MongoDB without retry logic
// function connectDB() {
//   mongoose
//     .connect(process.env.DB_URI, options)
//     .then(() => {
//       console.log(`Connected to MongoDB successfully`);
//     })
//     .catch((error) => {
//       console.error(`Error connecting to MongoDB:`, error);
//       process.exit(1);
//     });
// }

// module.exports = connectDB;

// Connect to db using the retry logic

async function retryConnect(attempt, interval) {
  if (retryOptions.maxAttempt <= 0) {
    throw new Error(`Maximum retry attempts exceeded`);
  }

  try {
    await mongoose.connect(process.env.DB_URI, options);
    console.log(`Connected to MongoDB successfully`);
  } catch (error) {
    console.log(`Error connecting to MongoDB: `, error);
    await new Promise((resolve) => setTimeout(resolve, interval));
    const newInterval = interval * retryOptions.factor;

    // calls the retryConnect function to retry
    return retryConnect(
      attempt + 1,
      newInterval > retryOptions.maxInterval
        ? retryOptions.maxInterval
        : newInterval
    );
  }
}

module.exports = retryConnect;
