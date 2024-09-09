const { createClient } = require("redis");

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 8800,
  },
  // password: process.env.REDIS_PASSWORD,
});
// const client = createClient();

client.on("connect", () => {
  console.log(`Redis client connected....`);
});

client.on("end", () => {
  console.log(`Redis client Disconnected...`);
});

// connect and handle the promise

client
  .connect()
  .then(() => {
    console.log(`Redis client connection success`);
  })
  .catch((err) => {
    console.error(`Redis client error:`, err);
  });

process.on("SIGINT", () => {
  console.log(`Closing the client gracefully`);
  client.quit();
});

module.exports = client;
