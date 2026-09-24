import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiFlag,
  FiPlusCircle,
  FiSmile,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import { getGoals, addGoal, updateGoal, deleteGoal, getLoggedInUser, getTransactions, getSubscriptions, getBudgets } from "../services/api";
import { buildFinancialEngine, getCurrentMonth } from "../utils/financialEngine";
import Spinner from "../components/Spinner";

const currency = (value = 0) =>
  `\u20B9${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--card-muted)] px-6 py-12 text-center">
    <div className="mb-4 rounded-full bg-[var(--green-soft)] p-4 text-[var(--green-deep)]">
      <FiTarget size={28} />
    </div>
    <p className="text-lg font-semibold text-slate-900">No Goals Yet</p>
    <p className="mt-1 max-w-sm text-sm text-slate-600">
      Create a savings target to track progress, monthly needs, and milestones.
    </p>
  </div>
);

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amountToAdd, setAmountToAdd] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentMonth = getCurrentMonth();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalRes, transactionRes, subscriptionRes, budgetRes] = await Promise.all([
        getGoals(),
        getTransactions(),
        getSubscriptions(),
        getBudgets({ params: { month: currentMonth } }),
      ]);
      setGoals(goalRes.data);
      setTransactions(transactionRes.data);
      setSubscriptions(subscriptionRes.data);
      setBudgets(budgetRes.data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
      setError("Could not load goals. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getLoggedInUser();
        setUserName(data?.name || "there");
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

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
      if (!amount || amount <= 0) return;
      await updateGoal(id, { amountToAdd: amount });
      setAmountToAdd({ ...amountToAdd, [id]: "" });
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
    setAmountToAdd({ ...amountToAdd, [id]: value });
  };

  const financialEngine = buildFinancialEngine({
    transactions,
    subscriptions,
    goals,
    budgets,
    month: currentMonth,
  });
  const goalInsights = financialEngine.goalInsights;
  const totalTarget = financialEngine.totalGoalTarget;
  const totalSaved = financialEngine.totalGoalSaved;
  const achievedGoals = goalInsights.filter((goal) => goal.achieved);
  const averageProgress = financialEngine.goalProgressPercentage;

  const tips = [];
  if (achievedGoals.length > 0) {
    tips.push(`${achievedGoals.length} goal ${achievedGoals.length === 1 ? "is" : "are"} complete. Consider setting the next milestone.`);
  }
  if (goalInsights.some((goal) => goal.progressPercentage >= 50 && !goal.achieved)) {
    tips.push("A few goals are past halfway. Small recurring deposits can finish them faster.");
  }
  if (goals.length > 0 && averageProgress < 25) {
    tips.push("Start with weekly additions to build momentum without stressing cash flow.");
  }
  if (goals.length === 0) {
    tips.push("Pick one practical target first, then make it visible here.");
  }
  financialEngine.recommendations.slice(0, 2).forEach((recommendation) => tips.push(recommendation));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)]"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--green-deep)]">{getGreeting()}, {userName}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Savings Goals</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Turn big plans into monthly moves you can actually keep.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--green-soft)] bg-[var(--green-soft)] px-4 py-3 text-[var(--green-deep)]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FiSmile />
              <span>{averageProgress >= 50 ? "You are building strong savings momentum." : "Every contribution counts."}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total Saved</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{currency(totalSaved)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wider text-slate-500">Target Value</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--gold-deep)]">{currency(totalTarget)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wider text-slate-500">Achieved</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--gold-deep)]">{achievedGoals.length}</p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2 text-[var(--gold-deep)]">
            <FiPlusCircle />
            <h2 className="text-xl font-bold text-slate-900">Create a New Goal</h2>
          </div>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <input
              type="text"
              placeholder="Goal Name (e.g., New Laptop)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
              required
            />
            <input
              type="number"
              placeholder="Target Amount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
              required
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-[var(--gold)] p-3 font-semibold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:bg-[var(--gold-deep)]"
              type="submit"
            >
              Create Goal
            </motion.button>
          </form>

          <div className="mt-6 rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4">
            <div className="mb-3 flex items-center gap-2 text-[var(--green-deep)]">
              <FiTrendingUp />
              <h3 className="font-bold text-slate-900">Financial Tips</h3>
            </div>
            <div className="space-y-2">
              {tips.map((tip) => (
                <p key={tip} className="rounded-lg bg-white p-3 text-sm text-slate-700 border border-[var(--border-soft)]">{tip}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)] lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Your Goals</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-4">
              {goalInsights.length > 0 ? goalInsights.map((goal, index) => {
                const insight = goal;
                const completionDate = insight.estimatedCompletionDate || goal.updatedAt || goal.deadline || goal.createdAt || new Date();

                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--gold)]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{goal.name}</span>
                          {insight.achieved && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold-soft)] bg-[var(--gold-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--gold-deep)]">
                              <FiAward /> Goal Achieved Badge
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Target: {currency(insight.target)}
                          {goal.deadline && ` by ${new Date(goal.deadline).toLocaleDateString()}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>

                    <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-[var(--beige-strong)]">
                      <motion.div
                        className="flex h-4 items-center justify-center rounded-full bg-[var(--green-deep)] text-xs font-semibold text-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(insight.progressPercentage, insight.progressPercentage > 0 ? 12 : 0)}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      >
                        {insight.progressPercentage.toFixed(0)}%
                      </motion.div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-[var(--border-soft)] bg-white p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Saved</p>
                        <p className="mt-1 font-bold text-[var(--green-deep)]">{currency(insight.saved)}</p>
                      </div>
                      <div className="rounded-xl border border-[var(--border-soft)] bg-white p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Remaining</p>
                        <p className="mt-1 font-bold text-[var(--gold-deep)]">{currency(insight.remaining)}</p>
                      </div>
                      <div className="rounded-xl border border-[var(--border-soft)] bg-white p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Monthly Need</p>
                        <p className="mt-1 font-bold text-amber-600">{currency(insight.monthlySavingsNeeded)}</p>
                      </div>
                    </div>

                    <div className={`mt-4 rounded-xl border p-3 text-sm ${insight.achieved ? "border-[var(--gold-soft)] bg-[var(--gold-soft)] text-[var(--gold-deep)]" : "border-[var(--green-soft)] bg-[var(--green-soft)] text-[var(--green-deep)]"}`}>
                      <div className="flex items-center gap-2">
                        {insight.achieved ? <FiCheckCircle /> : <FiFlag />}
                        <span>{insight.message}</span>
                      </div>
                      {insight.achieved && (
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                          <FiCalendar />
                          <span>Completion Date: {new Date(completionDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {!insight.achieved && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="number"
                          placeholder="Amount to add"
                          value={amountToAdd[goal._id] || ""}
                          onChange={(e) => handleAmountChange(goal._id, e.target.value)}
                          className="w-full rounded-lg border border-[var(--border-soft)] bg-white p-2 text-sm outline-none transition focus:border-[var(--green-deep)] focus:ring-2 focus:ring-[var(--green-soft)]"
                        />
                        <button
                          onClick={() => handleUpdateGoal(goal._id)}
                          className="rounded-lg bg-[var(--green-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--green-strong)]"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              }) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;
