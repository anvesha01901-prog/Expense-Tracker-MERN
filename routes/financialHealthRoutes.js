const express = require("express");
const router = express.Router();
const { getFinancialHealthScore } = require("../controllers/financialHealthController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

// @route   GET api/financial-health/score
// @desc    Calculate financial health score
// @access  Private
router.get("/score", getFinancialHealthScore);

module.exports = router;
