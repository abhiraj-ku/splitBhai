const { promisify } = require('util');
const redisClient = require('./redisServer');
const nodemailer = require('nodemailer');
const { json } = require('stream/consumers');
const cron = require('node-cron');

// Using promisify to convert the callback based to promise chains
const rpushAsync = promisify(redisClient.rPush).bind(redisClient);
const lpopAsync = promisify(redisClient.lPop).bind(redisClient);
const zaddAsync = promisify(redisClient.zAdd).bind(redisClient);
const zrangebyscoreAsync = promisify(redisClient.zRangeByScore).bind(redisClient);
const zremAsync = promisify(redisClient.zRem).bind(redisClient);

// Options for retry and queue names
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Function to send email using Nodemailer
async function sendMailWithRetry(mailOptions) {
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
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

// modular approach to handle different queue

async function processQueue(queueName, retryQueueName, dlqName) {
  const job = await lpopAsync(queueName);
  if (!job) return;

  // parse the queue information
  const jobData = json.parse(job);
  const { mailOptions, retries } = jobData;

  try {
    // Send email from respective queue
    await sendMailWithRetry(mailOptions);
  } catch (error) {
    console.error(`Error sending email from ${queueName}:`, error.message);

    if (retries < MAX_RETRIES) {
      // Retry Logic: increment retries and add to retry queue
      console.log(`Retrying job from ${queueName}... Attempt ${retries + 1}`);
      job.retries += 1;
      await zaddAsync(retryQueueName, Date.now() + RETRY_DELAY_MS, JSON.stringify(job));
    } else {
      // If max retries are reached, move to DLQ
      console.log(`Moving job from ${queueName} to DLQ after ${MAX_RETRIES} attempts`);
      await rpushAsync(dlqName, JSON.stringify(job));
    }
  }
}

// Generic function to process retry queues
async function processRetryQueue(retryQueueName, mainQueueName) {
  const timeNow = Date.now();
  const retryJobs = await zrangebyscoreAsync(retryQueueName, '-inf', timeNow);

  for (const jobData of retryJobs) {
    // Re-add job to the main queue and remove from retry queue
    await rpushAsync(mainQueueName, jobData);
    await zremAsync(retryQueueName, jobData);
  }
}

// Run cron jobs to poll the queue at specific time
// in this case we will poll the main queue at 12 am
// night and retry queue 2-3 hours later
function pollQueues(mainQueueName, retry_queue, dlqName) {
  // Run the job at night(12 AM ) for main queue
  cron.schedule('0 2 * * *', () => {
    console.log(`Processing main queue at night...12 AM`);
    processQueue(mainQueueName, retry_queue, dlqName);
  });

  // Run the job at night(2 AM ) for retry queue
  cron.schedule('0 2 * * *', () => {
    console.log(`Processing retry queue at night...2 AM`);
    processRetryQueue(retry_queue, dlqName);
  });
}

module.exports = {
  pollEmailQueue: () => pollQueues('email_queue', 'retry_queue', 'email_dlq'),
  pollInviteQueue: () => pollQueues('invite_queue', 'retry_invite_queue', 'invite_dlq'),
  pollBarterNotification: () => pollQueues('barter_notification', 'retry_queue', 'email_dlq'),
};
