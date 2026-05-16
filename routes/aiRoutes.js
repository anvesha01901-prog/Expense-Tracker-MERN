const express = require("express");
const router = express.Router();
const { getFinancialInsights } = require("../controllers/aiController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

// @route   POST api/ai/insights
// @desc    Generate financial insights
// @access  Private
router.post("/insights", getFinancialInsights);

module.exports = router;
