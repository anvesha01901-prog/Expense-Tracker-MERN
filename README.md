# AI-Powered Expense Tracker

This is a full-stack web application that helps you track your expenses, set budgets, and achieve your financial goals. It uses AI to provide you with smart insights into your spending habits.

## Features

- **User Authentication:** Secure signup, login, and logout functionality using JWT.
- **Expense Management:** Add, edit, and delete income and expense transactions.
- **Dashboard:** A comprehensive overview of your finances, including total balance, income vs. expenses, and category-wise charts.
- **Budget System:** Set monthly budgets for different categories and track your spending against them.
- **AI Financial Advisor:** Get smart insights and suggestions on how to improve your financial health.
- **Goal-Based Savings:** Set savings goals and track your progress towards them.
- **Subscription Tracker:** Keep track of your recurring subscriptions and their due dates.
- **Financial Health Score:** A score from 0 to 100 that represents your overall financial health.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Recharts, Framer Motion
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT
- **AI:** Gemini

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running
- A Gemini API key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/expense-tracker.git
    cd expense-tracker
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following:
    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    npm start
    ```

2.  **Start the frontend development server:**
    In a new terminal, run:
    ```bash
    cd client
    npm start
    ```

The application will be available at `http://localhost:3000`.

## API Routes

### Auth

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in a user.
- `GET /api/auth/user`: Get the logged-in user's data.

### Transactions

- `GET /api/transactions`: Get all transactions for the logged-in user.
- `POST /api/transactions`: Add a new transaction.
- `PUT /api/transactions/:id`: Update a transaction.
- `DELETE /api/transactions/:id`: Delete a transaction.

### Budgets

- `GET /api/budgets`: Get all budgets for the logged-in user.
- `POST /api/budgets`: Set or update a budget.

### Goals

- `GET /api/goals`: Get all goals for the logged-in user.
- `POST /api/goals`: Add a new goal.
- `PUT /api/goals/:id`: Update a goal (add savings).
- `DELETE /api/goals/:id`: Delete a goal.

### Subscriptions

- `GET /api/subscriptions`: Get all subscriptions for the logged-in user.
- `POST /api/subscriptions`: Add a new subscription.
- `PUT /api/subscriptions/:id`: Update a subscription.
- `DELETE /api/subscriptions/:id`: Delete a subscription.

### AI

- `GET /api/ai/insights`: Generate financial insights.

### Financial Health

- `GET /api/financial-health/score`: Calculate the financial health score.
