import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getSubscriptions, addSubscription, deleteSubscription } from "../services/api";
import Spinner from "../components/Spinner";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
      setError("Could not load subscriptions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    try {
      await addSubscription({ name, amount, billingCycle, nextDueDate });
      setName("");
      setAmount("");
      setBillingCycle("monthly");
      setNextDueDate("");
      fetchSubscriptions();
    } catch (error) {
      console.error("Failed to add subscription", error);
      alert("Failed to add subscription.");
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
        try {
            await deleteSubscription(id);
            fetchSubscriptions();
        } catch (error) {
            console.error("Failed to delete subscription", error);
            alert("Failed to delete subscription.");
        }
    }
  };

  return (
    <div>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6"
      >
        Subscription Tracker
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Add a New Subscription</h2>
          <form onSubmit={handleAddSubscription} className="space-y-4">
            <input
              type="text"
              placeholder="Subscription Name (e.g., Netflix)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
              required
            />
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
              required
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-500 p-2 rounded w-full"
              type="submit"
            >
              Add Subscription
            </motion.button>
          </form>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg row-span-2 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Your Subscriptions</h2>
          {loading ? <Spinner /> : error ? <p className="text-red-500">{error}</p> : (
            <div className="space-y-4">
              {subscriptions.length > 0 ? subscriptions.map((sub) => (
                <div key={sub._id} className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                      <p className="font-semibold">{sub.name}</p>
                      <p className="text-sm text-gray-400">
                          ₹{sub.amount.toFixed(2)} / {sub.billingCycle}
                      </p>
                  </div>
                  <div className="text-right">
                      <p className="text-sm">Next due:</p>
                      <p className="font-semibold">{new Date(sub.nextDueDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDeleteSubscription(sub._id)} className="text-red-400 hover:text-red-300">Delete</button>
                </div>
              )) : <p>No subscriptions added yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;