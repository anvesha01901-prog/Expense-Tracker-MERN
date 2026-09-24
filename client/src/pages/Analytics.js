import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FiActivity,
  FiAlertTriangle,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiCreditCard,
  FiFlag,
  FiPieChart,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { getTransactions, getGoals, getBudgets, getSubscriptions } from "../services/api";
import {
  buildFinancialEngine,
  formatCurrency,
  getCurrentMonth,
  getMonthlySubscriptionCost,
} from "../utils/financialEngine";
import Spinner from "../components/Spinner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const getMonthKey = (date) => new Date(date).toISOString().slice(0, 7);

const getPreviousMonth = (month) => {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
};

const getMonthTotal = (transactions, month, type) =>
  transactions
    .filter((transaction) => transaction.type === type)
    .filter((transaction) => getMonthKey(transaction.date) === month)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

const EmptyPrompt = ({ icon: Icon, title, text }) => (
  <div className="rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--card-muted)] p-5 text-center">
    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold-soft)] text-[var(--gold-deep)]">
      <Icon size={22} />
    </div>
    <p className="font-semibold text-slate-900">{title}</p>
    <p className="mt-1 text-sm text-slate-600">{text}</p>
  </div>
);

const InsightCard = ({ icon: Icon, title, children, tone = "blue" }) => {
  const toneClass = {
    blue: "text-[var(--gold-deep)] bg-[var(--gold-soft)] border-[var(--gold-soft)]",
    emerald: "text-[var(--green-deep)] bg-[var(--green-soft)] border-[var(--green-soft)]",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
    purple: "text-violet-700 bg-violet-50 border-violet-200",
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-xl border p-2.5 ${toneClass}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const buildSmartInsights = ({ transactions, categoryData, engine, currentMonth }) => {
  const insights = [];
  const previousMonth = getPreviousMonth(currentMonth);
  const currentSpend = getMonthTotal(transactions, currentMonth, "expense");
  const previousSpend = getMonthTotal(transactions, previousMonth, "expense");
  const sortedCategories = [...categoryData].sort((a, b) => b.value - a.value);
  const bestBudget = engine.budgetInsights
    .filter((budget) => budget.assigned > 0)
    .sort((a, b) => a.usagePercentage - b.usagePercentage)[0];
  const fastestGoal = engine.goalInsights
    .filter((goal) => !goal.achieved && goal.saved > 0)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)[0];

  if (currentSpend > 0 || previousSpend > 0) {
    if (currentSpend < previousSpend) {
      insights.push(`Spending decreased by ${formatCurrency(previousSpend - currentSpend)} compared to last month.`);
    } else if (currentSpend > previousSpend) {
      insights.push(`Spending increased by ${formatCurrency(currentSpend - previousSpend)} compared to last month.`);
    } else {
      insights.push("Spending is unchanged compared to last month.");
    }
  }

  if (sortedCategories[0]) {
    insights.push(`${sortedCategories[0].name} is your highest spending category at ${formatCurrency(sortedCategories[0].value)}.`);
  }

  if (bestBudget) {
    insights.push(`${bestBudget.category} is your best performing budget with ${bestBudget.usagePercentage.toFixed(0)}% used.`);
  }

  if (fastestGoal) {
    insights.push(`${fastestGoal.name} is your fastest growing goal at ${fastestGoal.progressPercentage.toFixed(0)}% complete.`);
  }

  return insights;
};

const getSpendingPersonality = (engine, categoryData) => {
  const topCategory = [...categoryData].sort((a, b) => b.value - a.value)[0];
  const savingsRate = engine.totalIncome > 0 ? (engine.monthlySavings / engine.totalIncome) * 100 : 0;

  if (engine.goalProgressPercentage >= savingsRate && engine.totalGoalSaved > 0) {
    return {
      label: "Goal Focused Saver",
      icon: FiTarget,
      text: `Your goals are ${engine.goalProgressPercentage.toFixed(0)}% funded overall, so your savings behavior is centered around milestones.`,
      tone: "emerald",
    };
  }

  if (savingsRate > engine.subscriptionIncomePercentage && engine.monthlySavings > 0) {
    return {
      label: "Smart Saver",
      icon: FiAward,
      text: `You are keeping ${savingsRate.toFixed(0)}% of income available after expenses and subscriptions.`,
      tone: "blue",
    };
  }

  if (topCategory && engine.totalExpenses > 0 && topCategory.value > engine.totalExpenses / Math.max(categoryData.length, 1)) {
    return {
      label: "Lifestyle Spender",
      icon: FiCreditCard,
      text: `${topCategory.name} is carrying the largest share of your spending pattern.`,
      tone: "amber",
    };
  }

  return {
    label: "Balanced Planner",
    icon: FiZap,
    text: "Your spending, goals, budgets, and subscriptions are spread without one area dominating the picture.",
    tone: "purple",
  };
};

const getMonthlyChallenge = (categoryData, engine) => {
  const sortedCategories = [...categoryData].sort((a, b) => b.value - a.value);
  const [topCategory, secondCategory] = sortedCategories;

  if (topCategory && secondCategory && topCategory.value > secondCategory.value) {
    const reduction = (topCategory.value - secondCategory.value) / 2;
    return `Reduce ${topCategory.name} spending by ${formatCurrency(reduction)} to bring it closer to ${secondCategory.name}.`;
  }

  if (engine.highestSubscription) {
    return `Review ${engine.highestSubscription.name}; it is your largest subscription at ${formatCurrency(getMonthlySubscriptionCost(engine.highestSubscription))}/month.`;
  }

  const openGoal = engine.goalInsights.find((goal) => !goal.achieved && goal.remaining > 0);
  if (openGoal && engine.monthlySavings > 0) {
    return `Move ${formatCurrency(Math.min(engine.monthlySavings, openGoal.remaining))} toward ${openGoal.name}.`;
  }

  return "Add expenses, goals, budgets, or subscriptions to generate a monthly challenge.";
};

const getPersonalizedTips = (engine, categoryData) => {
  const tips = [];
  const openGoal = engine.goalInsights.find((goal) => !goal.achieved && goal.remaining > 0);
  const topCategory = [...categoryData].sort((a, b) => b.value - a.value)[0];

  if (openGoal && engine.monthlySavings > 0) {
    tips.push(`You can allocate ${formatCurrency(Math.min(engine.monthlySavings, openGoal.remaining))} toward ${openGoal.name}.`);
  }
  if (engine.highestSubscription) {
    tips.push(`Reducing ${engine.highestSubscription.name} could increase savings by ${formatCurrency(getMonthlySubscriptionCost(engine.highestSubscription))}/month.`);
  }
  if (engine.totalIncome > 0 && engine.monthlySavings / engine.totalIncome > engine.totalExpenses / engine.totalIncome) {
    tips.push("Your current savings rate is stronger than your expense ratio.");
  }
  if (topCategory) {
    tips.push(`Review ${topCategory.name}; it is the largest visible spending area.`);
  }
  if (engine.budgetInsights.some((budget) => budget.exceededBy > 0)) {
    tips.push("One or more budgets are exceeded, so pause non-essential spending in those categories.");
  }

  return tips.length > 0 ? tips.slice(0, 5) : ["Add more financial data to unlock personalized tips."];
};

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentMonth = getCurrentMonth();

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionRes, goalRes, budgetRes, subscriptionRes] = await Promise.all([
        getTransactions(),
        getGoals(),
        getBudgets({ params: { month: currentMonth } }),
        getSubscriptions(),
      ]);
      setTransactions(transactionRes.data);
      setGoals(goalRes.data);
      setBudgets(budgetRes.data);
      setSubscriptions(subscriptionRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics data", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchAnalyticsData();

    const handleFocus = () => fetchAnalyticsData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAnalyticsData]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const categoryDataMap = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryDataMap).map((name) => ({
    name,
    value: categoryDataMap[name],
  }));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeVsExpenseData = [
    { name: "Total", Income: totalIncome, Expense: totalExpense },
  ];

  const monthlyDataMap = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, Income: 0, Expense: 0, timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime() };
    }
    if (t.type === "income") {
      acc[monthYear].Income += t.amount;
    } else {
      acc[monthYear].Expense += t.amount;
    }
    return acc;
  }, {});

  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.timestamp - b.timestamp);
  const engine = buildFinancialEngine({ transactions, subscriptions, goals, budgets, month: currentMonth });
  const smartInsights = buildSmartInsights({ transactions, categoryData, engine, currentMonth });
  const personality = getSpendingPersonality(engine, categoryData);
  const PersonalityIcon = personality.icon;
  const monthlyChallenge = getMonthlyChallenge(categoryData, engine);
  const unusedBudget = engine.budgetInsights.reduce((sum, budget) => sum + Math.max(budget.remaining, 0), 0);
  const potentialSavings = unusedBudget + engine.monthlySavings;
  const currentMonthIncome = getMonthTotal(transactions, currentMonth, "income");
  const previousMonth = getPreviousMonth(currentMonth);
  const previousMonthIncome = getMonthTotal(transactions, previousMonth, "income");
  const currentMonthExpense = getMonthTotal(transactions, currentMonth, "expense");
  const previousMonthExpense = getMonthTotal(transactions, previousMonth, "expense");
  const expectedIncome = currentMonthIncome || previousMonthIncome || engine.totalIncome;
  const expectedExpenses = (currentMonthExpense || previousMonthExpense || engine.totalExpenses) + engine.totalMonthlySubscriptionCost;
  const projectedBalance = expectedIncome - expectedExpenses;
  const tips = getPersonalizedTips(engine, categoryData);
  const hasAnyData = transactions.length > 0 || goals.length > 0 || budgets.length > 0 || subscriptions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-[var(--border-soft)] shadow-[0_12px_30px_var(--shadow-soft)]">
          <h2 className="text-xl font-semibold mb-6 text-slate-900">Expenses by Category</h2>
          {categoryData.length === 0 ? (
            <EmptyPrompt icon={FiPieChart} title="Add Expenses" text="Expense categories will appear here once transactions are saved." />
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #efe4d0", borderRadius: "12px", color: "#18212f" }}
                    itemStyle={{ color: "#18212f" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-[var(--border-soft)] shadow-[0_12px_30px_var(--shadow-soft)]">
          <h2 className="text-xl font-semibold mb-6 text-slate-900">Income vs Expenses (Monthly)</h2>
          {transactions.length === 0 ? (
            <EmptyPrompt icon={FiBarChart2} title="Add Income and Expenses" text="Monthly trends need saved transactions to calculate." />
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.length > 0 ? monthlyData : incomeVsExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5dccd" vertical={false} />
                  <XAxis dataKey={monthlyData.length > 0 ? "month" : "name"} stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #efe4d0", borderRadius: "12px", color: "#18212f" }}
                    cursor={{ fill: "rgba(215, 169, 74, 0.06)" }}
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="#2d8a5f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[var(--border-soft)] shadow-[0_10px_24px_var(--shadow-soft)]">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Savings</p>
          <p className={`text-2xl font-bold mt-2 ${totalIncome - totalExpense >= 0 ? "text-[var(--green-deep)]" : "text-red-500"}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border-soft)] shadow-[0_10px_24px_var(--shadow-soft)]">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Expense Ratio</p>
          <p className="text-2xl font-bold mt-2 text-[var(--gold-deep)]">
            {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border-soft)] shadow-[0_10px_24px_var(--shadow-soft)]">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Top Category</p>
          <p className="text-2xl font-bold mt-2 text-violet-700">
            {categoryData.length > 0 ? [...categoryData].sort((a, b) => b.value - a.value)[0].name : "N/A"}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,#fffdfb,#f8f3eb)] p-5 shadow-[0_20px_40px_var(--shadow-soft)] md:p-6">
        <div className="mb-6 flex flex-col gap-2 border-b border-[var(--border-soft)] pb-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--gold-deep)]">Finance Intelligence Center</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Connected financial intelligence</h2>
          <p className="max-w-3xl text-sm text-slate-600">
            Insights below are generated from your saved income, expenses, budgets, goals, and subscriptions.
          </p>
        </div>

        {!hasAnyData && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <EmptyPrompt icon={FiBarChart2} title="Add Expenses" text="Track spending to unlock category insights." />
            <EmptyPrompt icon={FiAlertTriangle} title="Create Budgets" text="Budgets power alerts and unused money detection." />
            <EmptyPrompt icon={FiTarget} title="Create Goals" text="Goals enable predictions and funding suggestions." />
            <EmptyPrompt icon={FiCreditCard} title="Add Subscriptions" text="Recurring costs improve forecasts and recommendations." />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <InsightCard icon={FiAward} title="Financial Health Score" tone={engine.financialHealthScore >= 80 ? "emerald" : engine.financialHealthScore >= 60 ? "blue" : "amber"}>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-extrabold text-slate-900">{engine.financialHealthScore}</p>
              <span className="pb-2 text-sm text-slate-500">/100</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--gold-deep)]">{engine.healthLabel}</p>
            <p className="mt-2 text-sm text-slate-600">
              Based on savings rate, budget usage, goal progress, subscription load, and expense control.
            </p>
          </InsightCard>

          <InsightCard icon={PersonalityIcon} title="Spending Personality" tone={personality.tone}>
            <p className="text-2xl font-bold text-slate-900">{personality.label}</p>
            <p className="mt-3 text-sm text-slate-600">{personality.text}</p>
          </InsightCard>

          <InsightCard icon={FiFlag} title="Monthly Challenge" tone="amber">
            <p className="text-sm leading-6 text-slate-700">{monthlyChallenge}</p>
          </InsightCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InsightCard icon={FiActivity} title="Smart Insights" tone="blue">
            <div className="space-y-3">
              {smartInsights.length > 0 ? smartInsights.map((insight) => (
                <p key={insight} className="rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] p-3 text-sm text-slate-700">{insight}</p>
              )) : (
                <EmptyPrompt icon={FiBarChart2} title="Add More Data" text="At least one transaction, budget, or goal is needed for smart insights." />
              )}
            </div>
          </InsightCard>

          <InsightCard icon={FiTarget} title="Goal Predictor" tone="emerald">
            <div className="space-y-3">
              {engine.goalInsights.length > 0 ? engine.goalInsights.map((goal) => (
                <div key={goal._id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{goal.name}</p>
                      <p className="mt-1 text-sm text-slate-600">Remaining: {formatCurrency(goal.remaining)}</p>
                    </div>
                    <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-xs font-semibold text-[var(--green-deep)]">
                      {goal.progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{goal.message}</p>
                  {goal.estimatedCompletionDate && (
                    <p className="mt-2 text-xs text-slate-500">Estimated completion: {new Date(goal.estimatedCompletionDate).toLocaleDateString()}</p>
                  )}
                </div>
              )) : (
                <EmptyPrompt icon={FiTarget} title="Create Goals" text="Goal forecasts appear once savings goals exist." />
              )}
            </div>
          </InsightCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <InsightCard icon={FiTrendingDown} title="Hidden Money Detector" tone="emerald">
            <div className="space-y-3 text-sm text-slate-700">
              <p>Unused budget: <span className="font-semibold text-[var(--green-deep)]">{formatCurrency(unusedBudget)}</span></p>
              <p>Subscription costs: <span className="font-semibold text-amber-700">{formatCurrency(engine.totalMonthlySubscriptionCost)}</span></p>
              <p>Potential savings available: <span className="font-semibold text-[var(--gold-deep)]">{formatCurrency(potentialSavings)}</span></p>
            </div>
          </InsightCard>

          <InsightCard icon={FiTrendingUp} title="Future Balance Forecast" tone="purple">
            <div className="space-y-3 text-sm text-slate-700">
              <p>Expected income: <span className="font-semibold text-[var(--green-deep)]">{formatCurrency(expectedIncome)}</span></p>
              <p>Expected expenses: <span className="font-semibold text-rose-600">{formatCurrency(expectedExpenses)}</span></p>
              <p>Projected balance: <span className={`font-semibold ${projectedBalance >= 0 ? "text-[var(--gold-deep)]" : "text-rose-600"}`}>{formatCurrency(projectedBalance)}</span></p>
            </div>
          </InsightCard>

          <InsightCard icon={FiCreditCard} title="Subscription Impact" tone="amber">
            <div className="space-y-3 text-sm text-slate-700">
              <p>Total subscription cost: <span className="font-semibold text-amber-700">{formatCurrency(engine.totalMonthlySubscriptionCost)}</span></p>
              <p>Percentage of income: <span className="font-semibold text-[var(--gold-deep)]">{engine.totalIncome > 0 ? `${engine.subscriptionIncomePercentage.toFixed(0)}%` : "N/A"}</span></p>
              <p>Upcoming renewals: <span className="font-semibold text-slate-900">{engine.renewalAlerts.length}</span></p>
              {engine.highestSubscription && (
                <p>Review {engine.highestSubscription.name} to potentially save {formatCurrency(getMonthlySubscriptionCost(engine.highestSubscription))}/month.</p>
              )}
            </div>
          </InsightCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InsightCard icon={FiAlertTriangle} title="Budget Alerts" tone="rose">
            <div className="space-y-3">
              {engine.budgetInsights.length > 0 ? engine.budgetInsights.map((budget) => (
                <div key={budget._id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{budget.category}</p>
                    <span className={budget.status === "danger" ? "text-rose-600" : budget.status === "warning" ? "text-amber-700" : "text-[var(--green-deep)]"}>
                      {budget.message}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[var(--beige-strong)]">
                    <div
                      className={`h-2 rounded-full ${budget.status === "danger" ? "bg-rose-500" : budget.status === "warning" ? "bg-amber-500" : "bg-[var(--green-deep)]"}`}
                      style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <EmptyPrompt icon={FiAlertTriangle} title="Create Budgets" text="Budget alerts appear after monthly budgets are created." />
              )}
            </div>
          </InsightCard>

          <InsightCard icon={FiCalendar} title="Personalized Financial Tips" tone="blue">
            <div className="space-y-3">
              {tips.map((tip) => (
                <p key={tip} className="rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] p-3 text-sm text-slate-700">{tip}</p>
              ))}
            </div>
          </InsightCard>
        </div>
      </section>
    </motion.div>
  );
};

export default Analytics;
