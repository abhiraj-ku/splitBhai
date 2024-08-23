const { createClient } = require("redis");
const wildcards = require("disposable-email-domains/wildcard.json");

const client = createClient({});

// when error
client.on("error", () => {
  console.log(`Redis client Error:`, error);
});

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
