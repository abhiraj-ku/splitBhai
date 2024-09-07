const { promisify } = require("util");
const redisClient = require("./redisServer");
const nodemailer = require("nodemailer");

// Using promisify to convert the callback based to promise chains
const rpushAsync = promisify(redisClient.rPush).bind(redisClient);
const lpopAsync = promisify(redisClient.lPop).bind(redisClient);
const zaddAsync = promisify(redisClient.zAdd).bind(redisClient);
const zrangebyscoreAsync = promisify(redisClient.zRangeByScore).bind(
  redisClient
);
const zremAsync = promisify(redisClient.zRem).bind(redisClient);

// Options for retry and queue names
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RETRY_QUEUE = "retry_queue";
const DLQ_KEY = "email_dlq";

// Function to send email using Nodemailer
async function sendMailWithRetry(mailOptions) {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Try to send the email
  await transporter.sendMail(mailOptions);
}

// process email from queue and handle retries
async function processEmailQueue() {
  const jobData = await lpopAsync("email_queue");
  if (!jobData) return;

  const job = JSON.parse(jobData);
  const { mailOptions, retries } = job;

  try {
    await sendMailWithRetry(mailOptions);
  } catch (error) {
    console.error(`Email Sending failed : ${error.message}`);

    // Retry Logic based on the retries and MAX_RETRIES
    if (retries < MAX_RETRIES) {
      console.log(`Retrying job.. Attempt ${retries + 1}`);

      // increase the retries so that it doesn't remain the main queue
      job.retries += 1;

      // add to retry queue
      await zaddAsync(
        RETRY_QUEUE,
        Date.now() + RETRY_DELAY_MS,
        JSON.stringify(job)
      );
    } else {
      console.log(`Moving to dlq after ${MAX_RETRIES} attempts`);
      await rpushAsync(DLQ_KEY, JSON.stringify(job));
    }
  }
}

// Process the RETRY_QUEUE
async function processRetryQueue() {
  const timeNow = Date.now();
  const retryJobs = await zrangebyscoreAsync(RETRY_QUEUE, "-inf", timeNow);

  //   for (let i = 0; i < retryJobs.length(); i++) {
  //     await rpushAsync("email_queue", jobData); // Re-add to queue
  //     await zremAsync(RETRY_QUEUE, jobData);
  //   }

  for (const jobData of retryJobs) {
    await rpushAsync("email-queue", jobData);
    await zremAsync(RETRY_QUEUE, jobData);
  }
}

// Poll the main email queue and retry queue periodicallly
setInterval(processEmailQueue, 1000); // process jobs(main email queue) periodically
setInterval(processRetryQueue, 1000); // check the retry queue every seconds

module.exports = {
  processEmailQueue,
  processRetryQueue,
};
