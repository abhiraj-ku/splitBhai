const { promisify } = require("util");
const redisClient = require("./redisServer");
const rpushAsync = promisify(redisClient.rPush).bind(redisClient);

// function to add  verify-email to email queue
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

async function queueInviteEmailSending(mailOptions) {
  const job = json.stringify({
    mailOptions,
    retries: 0,
  });
  try {
    await rpushAsync("invite_queue", job);
    console.log(`invite emails addded to queue`);
  } catch (error) {
    console.error(`Error adding emails to invite queue`);
    throw new Error(`Error adding emails to invite queue`);
  }
}

async function queueBarterNotification(mailOptions) {
  const job = json.stringify({
    mailOptions,
    retries: 0,
  });
  try {
    await rpushAsync("barter_notification", job);
    console.log(`Barter invite emails addded to queue`);
  } catch (error) {
    console.error(`Error adding emails to barter_notification queue`);
    throw new Error(`Error adding emails to barter_notification queue`);
  }
}

module.exports = {
  queueEmailSending,
  queueInviteEmailSending,
  queueBarterNotification,
};
