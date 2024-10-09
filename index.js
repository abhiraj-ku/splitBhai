require('dotenv').config();
const app = require('./app');
const logger = require('./logger');
const {
  pollEmailQueue,
  pollInviteQueue,
  pollBarterNotification,
} = require('./src/services/emailQueueProcessor');

const PORT = process.env.PORT;

// Start polling the Redis queues
pollEmailQueue();
pollInviteQueue();
pollBarterNotification();

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
});

// Gracefully close the server on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info(`SIGINT signal received, closing the server...`);

  server.close(() => {
    console.log(`Closed the HTTP server gracefully.`);
    process.exit(1);
  });
});
