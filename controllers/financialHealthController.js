const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const Subscription = require("../models/Subscription");

// @desc    Calculate financial health score
// @route   GET /api/financial-health/score
// @access  Private
exports.getFinancialHealthScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    // 1. Savings Rate (last 30 days)
    const transactions = await Transaction.find({ user: userId, date: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } });
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) : 0;
    const savingsRateScore = Math.max(0, Math.min(savingsRate * 100, 30)); // Max 30 points

    // 2. Budget Adherence
    const budgets = await Budget.find({ user: userId, month });
    let totalBudget = 0;
    let totalSpending = 0;
    if (budgets.length > 0) {
        for (const budget of budgets) {
            totalBudget += budget.amount;
            const spending = await Transaction.aggregate([
                { $match: { user: userId, category: budget.category, type: 'expense', date: { $gte: new Date(`${month}-01`), $lt: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)) } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            totalSpending += spending.length > 0 ? spending[0].total : 0;
        }
    }
    const budgetAdherence = totalBudget > 0 ? (1 - (Math.max(0, totalSpending - totalBudget) / totalBudget)) : 1;
    const budgetAdherenceScore = budgetAdherence * 30; // Max 30 points

    // 3. Goal Progress
    const goals = await Goal.find({ user: userId });
    let totalGoalProgress = 0;
    if (goals.length > 0) {
        const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
        const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
        totalGoalProgress = totalTarget > 0 ? (totalSaved / totalTarget) : 1;
    }
    const goalProgressScore = totalGoalProgress * 20; // Max 20 points

    // 4. Subscription Load
    const subscriptions = await Subscription.find({ user: userId });
    const monthlySubscriptionCost = subscriptions.reduce((acc, s) => {
        return s.billingCycle === 'monthly' ? acc + s.amount : acc + (s.amount / 12);
    }, 0);
    const subscriptionLoad = income > 0 ? (monthlySubscriptionCost / (income / (transactions.length > 0 ? 30 : 1) * 30)) : 0; // Normalize income to monthly
    const subscriptionLoadScore = Math.max(0, (1 - subscriptionLoad * 2)) * 20; // Max 20 points

    const financialHealthScore = Math.round(savingsRateScore + budgetAdherenceScore + goalProgressScore + subscriptionLoadScore);

    res.json({ score: Math.min(100, Math.max(0, financialHealthScore)) });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
