const { promisify } = require("util");
const redisClient = require("./redisServer");
const rpushAsync = promisify(redisClient.rPush).bind(redisClient);

// function to add a job to email queue
async function queueEmailSending(mailOptions) {
  const jobData = JSON.stringify({
    mailOptions,
    retries: 0, // Keep track of retries
  });

  try {
    await rpushAsync("email_queue", jobData);
    console.log("Job added to email queue");
  } catch (error) {
    console.error(`Error adding to email Queue`);
    throw new Error(`Error adding to email Queue`);
  }
}

module.exports = queueEmailSending;
