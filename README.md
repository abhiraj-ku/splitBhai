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

1. **Clone the Repo**: `git clone https://github.com/yourusername/splitbhai.git`
2. **Install Dependencies**: `npm install`
3. **Set Up Environment Variables**: Create a `.env` file based on `.env.example`.
4. **Run the App**: `npm start`
5. **Access the Dashboard**: Go to `http://localhost:4040` in your browser.

---

### Contributing

Contributions are welcome! Please submit pull requests or open issues for any features or bug fixes.

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
