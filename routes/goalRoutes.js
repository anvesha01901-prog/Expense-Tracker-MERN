const express = require("express");
const router = express.Router();
const { getGoals, addGoal, updateGoal, deleteGoal } = require("../controllers/goalController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

router.route("/")
    .get(getGoals)
    .post(addGoal);

router.route("/:id")
    .put(updateGoal)
    .delete(deleteGoal);

module.exports = router;
