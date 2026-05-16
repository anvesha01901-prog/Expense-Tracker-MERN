const express = require("express");
const router = express.Router();
const { getBudgets, setBudget } = require("../controllers/budgetController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

// @route   GET api/budgets
// @desc    Get all budgets for a user for a specific month
// @access  Private
router.get("/", getBudgets);

// @route   POST api/budgets
// @desc    Set or update a budget
// @access  Private
router.post("/", setBudget);

module.exports = router;
