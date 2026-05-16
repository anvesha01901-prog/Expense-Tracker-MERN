import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getBudgets, setBudget } from "../services/api";
import Spinner from "../components/Spinner";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getBudgets({ params: { month } });
      setBudgets(data);
    } catch (error) {
      console.error("Failed to fetch budgets", error);
      setError("Could not load budgets. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await setBudget({ category, amount, month });
      setCategory("");
      setAmount("");
      fetchBudgets();
    } catch (error) {
      console.error("Failed to set budget", error);
      alert("Failed to set budget.");
    }
  };

  return (
    <div>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6"
      >
        Budgets
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Set a New Budget</h2>
          <form onSubmit={handleSetBudget} className="space-y-4">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-500 p-2 rounded w-full"
              type="submit"
            >
              Set Budget
            </motion.button>
          </form>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Your Budgets for {month}</h2>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : error ? (
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-red-400 text-sm">{error}</div>
          ) : (
            <div className="space-y-4">
              {budgets.length > 0 ? budgets.map((budget) => (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={budget._id} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{budget.category}</span>
                    <span className="text-sm">
                      ₹{budget.spent.toFixed(2)} / <span className="text-gray-400">₹{budget.amount.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                      className={`h-2.5 rounded-full ${
                        (budget.spent / budget.amount) * 100 > 100 ? "bg-red-500" : "bg-blue-500"
                      }`}
                    ></motion.div>
                  </div>
                  {budget.spent > budget.amount && (
                      <p className="text-red-400 text-[10px] mt-1.5 flex items-center gap-1">
                        <span className="text-xs">⚠️</span> Budget exceeded by ₹{(budget.spent - budget.amount).toFixed(2)}
                      </p>
                  )}
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-sm">No budgets set for this month</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;
