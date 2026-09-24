import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getFinancialInsights,
  getSubscriptions,
  getGoals,
  getBudgets,
} from "../services/api";
import {
  buildFinancialEngine,
  formatCurrency,
  getCurrentMonth,
  getMonthlySubscriptionCost,
} from "../utils/financialEngine";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState(null);
  const currentMonth = getCurrentMonth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transRes, subscriptionsRes, goalsRes, budgetsRes] = await Promise.all([
        getTransactions(),
        getSubscriptions(),
        getGoals(),
        getBudgets({ params: { month: currentMonth } }),
      ]);
      setTransactions(transRes.data);
      setSubscriptions(subscriptionsRes.data);
      setGoals(goalsRes.data);
      setBudgets(budgetsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Could not load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (transactionData) => {
    await addTransaction(transactionData);
    fetchData();
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    await updateTransaction(id, transactionData);
    fetchData();
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  const fetchInsights = async () => {
    console.log("Fetching AI insights with transactions:", transactions);
    setLoadingInsights(true);
    setInsights("");
    try {
      const { data } = await getFinancialInsights(transactions);
      setInsights(data.insights);
    } catch (err) {
      console.error("Failed to fetch insights", err);
      setInsights(err.response?.data?.message || "Failed to get insights.");
    }
    setLoadingInsights(false);
  };

  const openAddModal = () => {
    setEditTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditTransaction(transaction);
    setIsModalOpen(true);
  };

  const financialEngine = buildFinancialEngine({
    transactions,
    subscriptions,
    goals,
    budgets,
    month: currentMonth,
  });

  const categoryData = Object.values(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { name: t.category, value: 0 };
        }
        acc[t.category].value += t.amount;
        return acc;
      }, {})
  );

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 max-w-md shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-medium text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const noTransactions = transactions.length === 0;

  return (
    <div className="space-y-8">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editTransaction ? "Edit Transaction" : "Add Transaction"}>
        <TransactionForm onClose={() => setIsModalOpen(false)} addTransaction={handleAddTransaction} updateTransaction={handleUpdateTransaction} editTransaction={editTransaction} />
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-4xl font-extrabold tracking-tight text-slate-900">
          Dashboard
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[var(--gold)] hover:bg-[var(--gold-deep)] px-6 py-2.5 rounded-xl shadow-lg shadow-[var(--gold-soft)] font-semibold text-white transition-all"
          onClick={openAddModal}
        >
          + Add Transaction
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_30px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Spendable Money</h2>
          <p className={`text-3xl font-bold ${financialEngine.availableBalance >= 0 ? "text-[var(--green-strong)]" : "text-rose-500"}`}>
            {formatCurrency(financialEngine.availableBalance)}
          </p>
          <p className="mt-2 text-xs text-slate-500">After expenses and subscriptions</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_30px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Income</h2>
          <p className="text-3xl font-bold text-[var(--green-strong)]">{formatCurrency(financialEngine.totalIncome)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_30px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Monthly Savings</h2>
          <p className="text-3xl font-bold text-[var(--gold-deep)]">{formatCurrency(financialEngine.monthlySavings)}</p>
          <p className="mt-2 text-xs text-slate-500">Expenses: {formatCurrency(financialEngine.totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_30px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Health Score</h2>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-[var(--green-deep)]">{financialEngine.financialHealthScore}</p>
            <span className="text-xs text-slate-500 font-medium">/100</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{financialEngine.healthLabel}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_28px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Subscription Impact</h2>
          <p className="text-2xl font-bold text-[var(--gold-deep)]">{formatCurrency(financialEngine.totalMonthlySubscriptionCost)}</p>
          <p className="mt-2 text-sm text-slate-600">
            {financialEngine.totalIncome > 0
              ? `Subscriptions consume ${financialEngine.subscriptionIncomePercentage.toFixed(0)}% of monthly income.`
              : "Add income to calculate subscription load."}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_28px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Goal Funding</h2>
          <p className="text-2xl font-bold text-[var(--green-deep)]">{formatCurrency(financialEngine.totalGoalRemaining)}</p>
          <p className="mt-2 text-sm text-slate-600">Remaining across active savings goals</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_28px_var(--shadow-soft)]">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Smart Recommendations</h2>
          <div className="mt-3 space-y-2">
            {financialEngine.recommendations.slice(0, 2).map((recommendation) => (
              <p key={recommendation} className="rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] p-3 text-sm text-slate-700">{recommendation}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_30px_var(--shadow-soft)]">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Recent Transactions</h2>
          {noTransactions ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-[var(--border-soft)] rounded-xl bg-[var(--card-muted)]">
              <p className="text-lg font-medium text-slate-700">No transactions found</p>
              <p className="text-sm">Start tracking your finances today!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.map((t, idx) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-[var(--card-muted)] hover:bg-[var(--beige)] border border-[var(--border-soft)] p-4 rounded-xl flex justify-between items-center transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${t.type === "income" ? "bg-[var(--green-soft)] text-[var(--green-deep)]" : "bg-rose-50 text-rose-600"}`}>
                      <span className="font-bold">{t.category.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.category}</p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-bold ${t.type === "income" ? "text-[var(--green-deep)]" : "text-rose-500"}`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{t.notes || "No notes"}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(t)} className="p-1.5 text-[var(--gold-deep)] hover:bg-[var(--gold-soft)] rounded-lg transition-colors">Edit</button>
                      <button onClick={() => handleDeleteTransaction(t._id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--border-soft)] shadow-[0_10px_30px_var(--shadow-soft)]">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Distribution</h2>
          {noTransactions || categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 text-center bg-[var(--card-muted)] rounded-xl border border-[var(--border-soft)]">
              <p>Add expenses to see</p>
              <p>your distribution</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #efe4d0", borderRadius: "12px", color: "#18212f" }}
                    itemStyle={{ color: "#18212f" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[10px] text-slate-600 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#fffaf2,#f5f9f3,#ffffff)] p-8 rounded-2xl border border-[var(--border-soft)] shadow-[0_15px_40px_var(--shadow-soft)] relative overflow-hidden group">
        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Smart Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {financialEngine.recommendations.map((recommendation) => (
                <div key={recommendation} className="rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-4 text-sm text-slate-700">
                  {recommendation}
                </div>
              ))}
            </div>
            {financialEngine.highestSubscription && (
              <p className="mt-4 text-sm text-slate-700">
                Canceling {financialEngine.highestSubscription.name} would save {formatCurrency(getMonthlySubscriptionCost(financialEngine.highestSubscription))}/month.
              </p>
            )}
            {financialEngine.renewalAlerts.length > 0 && (
              <p className="mt-2 text-sm text-[var(--gold-deep)]">Upcoming renewals this week: {financialEngine.renewalAlerts.length}</p>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900">
            <span className="text-3xl">AI</span> Financial Advisor
          </h2>
          <p className="text-slate-600 mb-6 max-w-2xl">Get personalized insights and suggestions based on your spending habits to improve your financial health.</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--gold)] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[var(--gold-soft)] hover:bg-[var(--gold-deep)] transition-colors flex items-center gap-2"
            onClick={fetchInsights}
            disabled={loadingInsights}
          >
            {loadingInsights ? <Spinner /> : "Analyze My Spending"}
          </motion.button>

          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white p-6 rounded-xl border border-[var(--border-soft)] font-mono text-sm text-slate-700 leading-relaxed shadow-inner"
            >
              <p className="whitespace-pre-wrap">{insights}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
