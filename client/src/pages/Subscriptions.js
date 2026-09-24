import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiPlusCircle,
  FiRefreshCw,
  FiSmile,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";
import { getSubscriptions, addSubscription, deleteSubscription, getLoggedInUser, getTransactions, getGoals, getBudgets } from "../services/api";
import { buildFinancialEngine, getCurrentMonth, getMonthlySubscriptionCost, getRenewalAlert } from "../utils/financialEngine";
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

const toneClasses = {
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  blue: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  rose: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--card-muted)] px-6 py-12 text-center">
    <div className="mb-4 rounded-full bg-[var(--gold-soft)] p-4 text-[var(--gold-deep)]">
      <FiRefreshCw size={28} />
    </div>
    <p className="text-lg font-semibold text-slate-900">No Subscriptions Found</p>
    <p className="mt-1 max-w-sm text-sm text-slate-600">
      Add recurring payments to see monthly cost, upcoming renewals, and smart alerts.
    </p>
  </div>
);

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentMonth = getCurrentMonth();

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subscriptionRes, transactionRes, goalRes, budgetRes] = await Promise.all([
        getSubscriptions(),
        getTransactions(),
        getGoals(),
        getBudgets({ params: { month: currentMonth } }),
      ]);
      setSubscriptions(subscriptionRes.data);
      setTransactions(transactionRes.data);
      setGoals(goalRes.data);
      setBudgets(budgetRes.data);
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
      setError("Could not load subscriptions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

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

  const financialEngine = buildFinancialEngine({
    transactions,
    subscriptions,
    goals,
    budgets,
    month: currentMonth,
  });
  const totalMonthlyCost = financialEngine.totalMonthlySubscriptionCost;
  const upcomingRenewal = financialEngine.upcomingRenewal;
  const renewalAlerts = financialEngine.renewalAlerts;

  const tips = [];
  if (totalMonthlyCost > 5000) {
    tips.push("Subscription spending is high. Review annual plans or unused services.");
  }
  if (renewalAlerts.length > 0) {
    tips.push("Check upcoming renewals before they charge your card.");
  }
  if (subscriptions.length > 0 && totalMonthlyCost <= 2000) {
    tips.push("Recurring costs look controlled. Keep reviewing them monthly.");
  }
  if (subscriptions.length === 0) {
    tips.push("Track every recurring payment, even small ones, to avoid silent spend.");
  }
  if (financialEngine.highestSubscription) {
    tips.push(`Canceling ${financialEngine.highestSubscription.name} would save ${currency(getMonthlySubscriptionCost(financialEngine.highestSubscription))}/month.`);
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
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Subscription Tracker</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Keep recurring costs visible before they quietly shape your month.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--gold-soft)] bg-[var(--gold-soft)] px-4 py-3 text-[var(--gold-deep)]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FiSmile />
              <span>{subscriptions.length > 0 ? "You are keeping recurring payments visible." : "Add your first recurring payment to begin."}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-500">Active Subscriptions</p>
            <FiCreditCard className="text-[var(--gold-deep)]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{subscriptions.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-500">Monthly Cost</p>
            <FiTrendingUp className="text-[var(--green-deep)]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[var(--green-deep)]">{currency(totalMonthlyCost)}</p>
          <p className="mt-1 text-xs text-slate-600">
            {financialEngine.totalIncome > 0
              ? `${financialEngine.subscriptionIncomePercentage.toFixed(0)}% of monthly income`
              : "Add income to calculate impact"}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-500">Upcoming Renewal</p>
            <FiCalendar className="text-amber-600" />
          </div>
          <p className="mt-2 truncate text-lg font-extrabold text-amber-600">
            {upcomingRenewal ? upcomingRenewal.name : "None"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {upcomingRenewal ? new Date(upcomingRenewal.nextDueDate).toLocaleDateString() : "No upcoming date"}
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-[0_12px_30px_var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2 text-[var(--gold-deep)]">
            <FiPlusCircle />
            <h2 className="text-xl font-bold text-slate-900">Add a New Subscription</h2>
          </div>
          <form onSubmit={handleAddSubscription} className="space-y-4">
            <input
              type="text"
              placeholder="Subscription Name (e.g., Netflix)"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--beige)] p-3 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
              required
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-[var(--gold)] p-3 font-semibold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:bg-[var(--gold-deep)]"
              type="submit"
            >
              Add Subscription
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
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Subscriptions</h2>
            {renewalAlerts.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-soft)] bg-[var(--gold-soft)] px-3 py-1 text-xs font-semibold text-[var(--gold-deep)]">
                <FiAlertCircle /> {renewalAlerts.length} smart renewal {renewalAlerts.length === 1 ? "alert" : "alerts"}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-4">
              {subscriptions.length > 0 ? subscriptions.map((sub, index) => {
                const renewalAlert = getRenewalAlert(sub.nextDueDate);

                return (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-xl border border-[var(--border-soft)] bg-[var(--card-muted)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--gold)]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{sub.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {currency(sub.amount)} / {sub.billingCycle}
                          {sub.billingCycle === "yearly" && (
                            <span className="text-slate-500"> ({currency(getMonthlySubscriptionCost(sub))} monthly avg)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <div className="rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm">
                          <p className="text-xs text-slate-500">Next due</p>
                          <p className="font-semibold text-slate-900">{new Date(sub.nextDueDate).toLocaleDateString()}</p>
                        </div>
                        {renewalAlert && (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[renewalAlert.tone]}`}>
                            <FiClock /> {renewalAlert.label}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteSubscription(sub._id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
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

export default Subscriptions;
