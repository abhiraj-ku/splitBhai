const { createClient } = require("redis");

const client = createClient({});

// when error
client.on("error", () => {
  console.log(`Redis client Error:`, error);
});

client.on("on", () => {
  console.log(`Closing the redis instance`);
});

// connect and handle the promise

client
  .connect()
  .then(() => {
    // set the key-value to redis server
    client.set("ab", 56);
  })
  .then(() => {
    // get the value of key "ab"
    return client.get("ab");
  })
  .then((value) => {
    console.log(`Value of ab:`, value);
  })
  .catch((err) => {
    console.error(`Redis client error:`, err);
  })
  .finally(() => {
    client.quit();
  });
