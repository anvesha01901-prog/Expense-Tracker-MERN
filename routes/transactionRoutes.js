const express = require("express");
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

// @route   GET api/transactions
// @desc    Get all transactions for a user
// @access  Private
router.get("/", getTransactions);

// @route   POST api/transactions
// @desc    Add a new transaction
// @access  Private
router.post("/", addTransaction);

// @route   PUT api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put("/:id", updateTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete("/:id", deleteTransaction);

module.exports = router;