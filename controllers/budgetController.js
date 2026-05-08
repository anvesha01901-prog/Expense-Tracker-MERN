const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// @desc    Get all budgets for the logged-in user for a specific month
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const budgets = await Budget.find({ user: req.user.id, month });

    // For each budget, get the actual spending
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await Transaction.aggregate([
          {
            $match: {
              user: budget.user,
              category: budget.category,
              type: "expense",
              date: {
                $gte: new Date(`${month}-01`),
                $lt: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);
        return {
          ...budget.toObject(),
          spent: spending.length > 0 ? spending[0].total : 0,
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Set or update a budget
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res) => {
  const { category, amount, month } = req.body;

  try {
    let budget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
    });

    if (budget) {
      // Update existing budget
      budget.amount = amount;
      await budget.save();
      res.json(budget);
    } else {
      // Create new budget
      budget = new Budget({
        user: req.user.id,
        category,
        amount,
        month,
      });
      await budget.save();
      res.status(201).json(budget);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
