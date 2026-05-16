import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getGoals, addGoal, updateGoal, deleteGoal } from "../services/api";
import Spinner from "../components/Spinner";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amountToAdd, setAmountToAdd] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getGoals();
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
      setError("Could not load goals. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await addGoal({ name, targetAmount, deadline });
      setName("");
      setTargetAmount("");
      setDeadline("");
      fetchGoals();
    } catch (error) {
      console.error("Failed to add goal", error);
      alert("Failed to add goal.");
    }
  };

  const handleUpdateGoal = async (id) => {
    try {
        const amount = amountToAdd[id];
        if(!amount || amount <= 0) return;
        await updateGoal(id, { amountToAdd: amount });
        setAmountToAdd({...amountToAdd, [id]: ""});
        fetchGoals();
    } catch (error) {
        console.error("Failed to update goal", error);
        alert("Failed to add savings to goal.");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
        try {
            await deleteGoal(id);
            fetchGoals();
        } catch (error) {
            console.error("Failed to delete goal", error);
            alert("Failed to delete goal.");
        }
    }
  };

  const handleAmountChange = (id, value) => {
    setAmountToAdd({...amountToAdd, [id]: value});
  }

  return (
    <div>
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6"
      >
        Savings Goals
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Create a New Goal</h2>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <input
              type="text"
              placeholder="Goal Name (e.g., New Laptop)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
              required
            />
            <input
              type="number"
              placeholder="Target Amount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
              required
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2 rounded bg-gray-700/50 border border-gray-600"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-500 p-2 rounded w-full"
              type="submit"
            >
              Create Goal
            </motion.button>
          </form>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg row-span-2 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Your Goals</h2>
          {loading ? <Spinner /> : error ? <p className="text-red-500">{error}</p> : (
            <div className="space-y-4">
              {goals.length > 0 ? goals.map((goal) => (
                <div key={goal._id} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{goal.name}</span>
                    <button onClick={() => handleDeleteGoal(goal._id)} className="text-red-400 hover:text-red-300">Delete</button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Target: ₹{goal.targetAmount.toFixed(2)}
                    {goal.deadline && ` by ${new Date(goal.deadline).toLocaleDateString()}`}
                  </p>
                  <div className="w-full bg-gray-600 rounded-full h-4 mt-2">
                    <div
                      className="bg-green-500 h-4 rounded-full text-xs text-white flex items-center justify-center"
                      style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                    >
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-sm mt-1">
                    Saved: ₹{goal.currentAmount.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-2">
                      <input 
                          type="number"
                          placeholder="Amount to add"
                          value={amountToAdd[goal._id] || ""}
                          onChange={(e) => handleAmountChange(goal._id, e.target.value)}
                          className="w-full p-1 rounded bg-gray-900/50 text-sm border border-gray-600"
                      />
                      <button onClick={() => handleUpdateGoal(goal._id)} className="bg-green-600 hover:bg-green-500 p-1 px-2 rounded text-sm">Add</button>
                  </div>
                </div>
              )) : <p>No goals yet. Create one to get started!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;