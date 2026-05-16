const express = require("express");
const router = express.Router();
const { getSubscriptions, addSubscription, updateSubscription, deleteSubscription } = require("../controllers/subscriptionController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

router.route("/")
    .get(getSubscriptions)
    .post(addSubscription);

router.route("/:id")
    .put(updateSubscription)
    .delete(deleteSubscription);

module.exports = router;
