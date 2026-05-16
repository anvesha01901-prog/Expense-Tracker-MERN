const Goal = require("../models/Goal");

// @desc    Get all goals for the logged-in user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Add a new goal
// @route   POST /api/goals
// @access  Private
exports.addGoal = async (req, res) => {
  const { name, targetAmount, deadline } = req.body;

  try {
    const newGoal = new Goal({
      user: req.user.id,
      name,
      targetAmount,
      deadline,
    });

    const goal = await newGoal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update a goal (e.g., add savings)
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
    const { amountToAdd } = req.body;

    try {
        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        goal.currentAmount += Number(amountToAdd);

        // Prevent current amount from exceeding target amount
        if (goal.currentAmount > goal.targetAmount) {
            goal.currentAmount = goal.targetAmount;
        }

        await goal.save();
        res.json(goal);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({ message: "Goal removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
