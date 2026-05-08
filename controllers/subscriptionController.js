const Subscription = require("../models/Subscription");

// @desc    Get all subscriptions for the logged-in user
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ nextDueDate: 1 });
    res.json(subscriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Add a new subscription
// @route   POST /api/subscriptions
// @access  Private
exports.addSubscription = async (req, res) => {
  const { name, amount, billingCycle, nextDueDate } = req.body;

  try {
    const newSubscription = new Subscription({
      user: req.user.id,
      name,
      amount,
      billingCycle,
      nextDueDate,
    });

    const subscription = await newSubscription.save();
    res.status(201).json(subscription);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
    try {
        let subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (subscription.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(subscription);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
exports.deleteSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.json({ message: "Subscription removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
