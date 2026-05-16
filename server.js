const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes"); // ✅ IMPORTANT
const budgetRoutes = require("./routes/budgetRoutes");
const aiRoutes = require("./routes/aiRoutes");
const goalRoutes = require("./routes/goalRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const financialHealthRoutes = require("./routes/financialHealthRoutes");

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes); // ✅ IMPORTANT
app.use("/api/budgets", budgetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/financial-health", financialHealthRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// server start
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});