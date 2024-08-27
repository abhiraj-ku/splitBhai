const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { createClient } = require("redis");

// Creates a reusable function to make limiter async
async function createRateLimiter() {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
    password: process.env.REDIS_PASSWORD,
  });

  // Handle the connection errors
  client.on("error", (err) => {
    console.error(`Redis connection error in limiter:`, err);
  });

  // connect to redis
  try {
    await client.connect();
    console.log(`Connected to redis for rate limiting`);
  } catch (error) {
    console.error(`Failed to connect to redis for limiter`);
  }

  // Rate limit options
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,

    // redis store config
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),
  });

  return limiter;
}

module.exports = createRateLimiter;
