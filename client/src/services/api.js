import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem("token")) {
    req.headers["x-auth-token"] = localStorage.getItem("token");
  }
  return req;
});

// Auth
export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);
export const getLoggedInUser = () => API.get("/auth/user");

// Transactions
export const getTransactions = () => API.get("/transactions");
export const addTransaction = (transactionData) => API.post("/transactions", transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// Goals
export const getGoals = () => API.get("/goals");
export const addGoal = (goalData) => API.post("/goals", goalData);
export const updateGoal = (id, savingsData) => API.put(`/goals/${id}`, savingsData);
export const deleteGoal = (id) => API.delete(`/goals/${id}`);

// Subscriptions
export const getSubscriptions = () => API.get("/subscriptions");
export const addSubscription = (subscriptionData) => API.post("/subscriptions", subscriptionData);
export const deleteSubscription = (id) => API.delete(`/subscriptions/${id}`);

// Financial Health
export const getFinancialHealthScore = () => API.get("/financial-health/score");

// Budgets
export const getBudgets = (params) => API.get("/budgets", params);
export const setBudget = (budgetData) => API.post("/budgets", budgetData);

// AI Insights
export const getFinancialInsights = (transactions) => API.post("/ai/insights", { transactions });





