# splitBhai - Smart Group Expense Management

![MIT License](https://img.shields.io/badge/License-MIT-brightgreen)

splitBhai is a group expense management app that simplifies shared expenses, offers smart financial insights, and includes features like event planning, gamified debt settlement, and non-monetary bartering options.

## Features

### 1. User Onboarding & Authentication

- **Sign Up / Sign In**: Secure user registration with optional OTP and TOTP verification.
- **Authentication**: JWT-based, with secure password storage using bcrypt.
- **Security**: Rate-limiting, HTTPS, secure cookies, CSRF protection.

### 2. User Dashboard

- **Post-Login Overview**: View groups, expenses, events, and savings goals.
- **Analytics**: Smart insights and debt analysis from MongoDB.

### 3. Group Management

- **Create/Join Groups**: Invite members via links or codes.
- **Notifications**: Real-time updates using WebSockets or Firebase.

### 4. Expense & Event Planning

- **Expense Management**: Add, split, and categorize expenses within groups.
- **Event Planning**: Tag expenses to events and manage timelines.

### 5. Gamified Debt Settlement & Savings

- **Debt Challenges**: Rewards for timely settlements.
- **Automated Savings**: Monthly contributions with CRON jobs.

### 6. Smart Financial Insights & Geo-Tracking

- **Spending Analytics**: Track spending habits and trends.
- **Geo-Tagging**: Tag expenses by location for events and trips.

### 7. Non-Monetary Bartering

- **Debt Settlement**: Settle debts using goods or services instead of cash.

### 8. Notifications & Alerts

- **Reminders**: Alerts for payments, events, and group activities.
- **Real-Time Updates**: Handled via message queues and WebSockets.

### 9. Payment Integration (Optional)

- **In-App Payments**: Settle debts directly using payment gateways.

### 10. Settings & Account Management

- **Profile & Security**: Manage profile, 2FA, and app preferences.

## Tech Stack

- **Node.js/Express**: Backend framework.
- **MongoDB**: Database for user, group, and expense data.
- **Redis**: Caching, OTP storage, real-time data.
- **JWT**: Authentication.
- **Kafka**: Messaging queue for notifications.
- **Cron Jobs**: Automated tasks.
- **WebSockets/Firebase**: Real-time communication.

## Security & Best Practices

- **Environment Variables**: Secure handling of sensitive data.
- **Role-Based Access Control**: For group admins and members.
- **Input Validation & API Rate Limiting**: To mitigate attacks.

## Deployment & Scalability

- **AWS Deployment**: Autoscaling, load balancers.
- **Docker & Kubernetes**: Containerization and orchestration.
- **CI/CD Pipelines**: Continuous integration and deployment.

---

### Getting Started

## Getting Started for Developers

This guide will help you set up splitBhai for local development.

**Clone the Repository:**

1.  Open your terminal.
2.  Run the following command to clone the project to your local machine:

```
git clone https://github.com/yourusername/splitbhai.git

```

**Install Dependencies:**

1.  Navigate into the project folder using the following command:

```
cd splitbhai

```

2.  Install the required packages by running:

```
npm install

```

**Set Up Environment Variables:**

1.  Create a file named `.env` in the root directory of the project.
2.  Copy the contents of the `.env.example` file into the new `.env` file.
3.  Update the necessary values in the `.env` file according to your configuration.

**Run the Application:**

1.  Start the development server by running the following command in your terminal:

```
npm start

```

**Access the Application:**

1.  Open your web browser.
2.  Go to http://localhost:4040 to access the splitBhai application.

**Further Instructions**

For more detailed instructions on technical aspects and deployment procedures, refer to the README file inside the `docs` folder of the project.

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
