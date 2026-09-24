import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCreditCard,
  FiPieChart,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { getBudgets, setBudget, getLoggedInUser, getTransactions, getSubscriptions, getGoals } from "../services/api";
import { buildFinancialEngine } from "../utils/financialEngine";
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

const getBudgetStatus = (percentage) => {
  if (percentage > 100) {
    return {
      label: "Budget exceeded. Review spending.",
      color: "text-rose-300",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      ring: "#f43f5e",
      icon: FiAlertTriangle,
    };
  }
  if (percentage >= 80) {
    return {
      label: "Warning: 80% of budget already used.",
      color: "text-amber-300",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      ring: "#f59e0b",
      icon: FiAlertTriangle,
    };
  }
  return {
    label: "Great! You are within budget.",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "#10b981",
    icon: FiCheckCircle,
  };
};

const ProgressRing = ({ percentage, color }) => {
  const radius = 48;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="-rotate-90 h-full w-full" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={normalizedRadius}
          fill="transparent"
          stroke="#374151"
          strokeWidth={stroke}
        />
        <motion.circle
          cx="48"
          cy="48"
          r={normalizedRadius}
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold">{percentage.toFixed(0)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-400">used</span>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--card-muted)] px-6 py-12 text-center">
    <div className="mb-4 rounded-full bg-[var(--gold-soft)] p-4 text-[var(--gold-deep)]">
      <FiCreditCard size={28} />
    </div>
    <p className="text-lg font-semibold text-slate-900">No Budget Created</p>
    <p className="mt-1 max-w-sm text-sm text-slate-600">
      Add a category budget for this month to unlock progress tracking and spending insights.
    </p>
  </div>
);

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [budgetRes, transactionRes, subscriptionRes, goalRes] = await Promise.all([
        getBudgets({ params: { month } }),
        getTransactions(),
        getSubscriptions(),
        getGoals(),
      ]);
      setBudgets(budgetRes.data);
      setTransactions(transactionRes.data);
      setSubscriptions(subscriptionRes.data);
      setGoals(goalRes.data);
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

  const financialEngine = buildFinancialEngine({
    transactions,
    subscriptions,
    goals,
    budgets,
    month,
  });
  const budgetInsights = financialEngine.budgetInsights;
  const totalBudget = financialEngine.totalBudgetAssigned;
  const totalSpent = financialEngine.totalBudgetSpent;
  const totalRemaining = totalBudget - totalSpent;
  const usagePercentage = financialEngine.budgetUsagePercentage;
  const status = getBudgetStatus(usagePercentage);
  const StatusIcon = status.icon;
  const overBudgetCount = budgetInsights.filter((budget) => budget.exceededBy > 0).length;
  const warningCount = budgetInsights.filter((budget) => budget.usagePercentage >= 80 && budget.usagePercentage <= 100).length;

  const tips = [];
  if (overBudgetCount > 0) {
    tips.push(`${overBudgetCount} budget ${overBudgetCount === 1 ? "category needs" : "categories need"} a quick review.`);
  }
  if (warningCount > 0) {
    tips.push("Slow discretionary spending until the month resets.");
  }
  if (budgets.length > 0 && usagePercentage < 70) {
    tips.push("Good pacing so far. Keep a buffer for end-of-month expenses.");
  }
  if (budgets.length === 0) {
    tips.push("Start with one high-spend category, then expand your monthly plan.");
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
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--gold-deep)]">{getGreeting()}, {userName}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Budgets</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Small course corrections today make the month feel calmer tomorrow.
            </p>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${status.bg} ${status.border}`}>
            <div className={`flex items-center gap-2 text-sm font-semibold ${status.color}`}>
              <StatusIcon />
              <span>{status.label}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)] xl:col-span-2"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[var(--gold-deep)]">
                <FiPieChart />
                <h2 className="text-xl font-bold text-slate-900">Budget Insights</h2>
              </div>
              <p className="text-sm text-slate-600">
                You have spent {currency(totalSpent)} of {currency(totalBudget)} planned for {month}.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Remaining</p>
                  <p className={`mt-1 text-xl font-bold ${totalRemaining >= 0 ? "text-[var(--green-deep)]" : "text-rose-500"}`}>
                    {currency(Math.abs(totalRemaining))}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Categories</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{budgetInsights.length}</p>
                </div>
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Over Budget</p>
                  <p className="mt-1 text-xl font-bold text-rose-500">{overBudgetCount}</p>
                </div>
              </div>
            </div>
            <ProgressRing percentage={usagePercentage} color={status.ring} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)]"
        >
          <div className="mb-4 flex items-center gap-2 text-[var(--green-deep)]">
            <FiTrendingUp />
            <h2 className="text-xl font-bold text-slate-900">Financial Tips</h2>
          </div>
          <div className="space-y-3">
            {tips.map((tip) => (
              <div key={tip} className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-3 text-sm text-slate-700">
                {tip}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2 text-[var(--gold-deep)]">
            <FiTarget />
            <h2 className="text-xl font-bold text-slate-900">Set a New Budget</h2>
          </div>
          <form onSubmit={handleSetBudget} className="space-y-4">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
              required
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-[var(--gold)] p-3 font-semibold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:bg-[var(--gold-deep)]"
              type="submit"
            >
              Set Budget
            </motion.button>
          </form>
        </div>

        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)]">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Your Budgets for {month}</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-4">
              {budgetInsights.length > 0 ? budgetInsights.map((budget, index) => {
                const budgetAmount = budget.assigned;
                const spent = budget.spent;
                const percentage = budget.usagePercentage;
                const itemStatus = getBudgetStatus(percentage);
                const ItemIcon = itemStatus.icon;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    key={budget._id}
                    className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--gold)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-semibold text-slate-900">{budget.category}</span>
                        <div className={`mt-1 flex items-center gap-1 text-xs ${itemStatus.color}`}>
                          <ItemIcon />
                          <span>{itemStatus.label}</span>
                        </div>
                      </div>
                      <span className="text-right text-sm text-slate-700">
                        {currency(spent)} / <span className="text-slate-500">{currency(budgetAmount)}</span>
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--beige-strong)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`h-2.5 rounded-full ${percentage > 100 ? "bg-rose-500" : percentage >= 80 ? "bg-amber-500" : "bg-[var(--green-deep)]"}`}
                      />
                    </div>
                    {spent > budgetAmount && (
                      <p className="mt-2 text-xs text-rose-500">
                        Budget exceeded by {currency(spent - budgetAmount)}
                      </p>
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

export default Budget;
