import { useState, useEffect } from "react";
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
import { getTransactions } from "../services/api";
import Spinner from "../components/Spinner";

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions for analytics", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-gray-400">
        <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
        <p>Start adding transactions to see your financial analytics!</p>
      </div>
    );
  }

  // Process data for Category-wise Expense (Pie Chart)
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const categoryDataMap = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryDataMap).map((name) => ({
    name,
    value: categoryDataMap[name],
  }));

  // Process data for Income vs Expense (Bar Chart)
  // Group by month/year or just total for now as requested "Income vs Expense chart"
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeVsExpenseData = [
    { name: "Total", Income: totalIncome, Expense: totalExpense },
  ];

  // Group by month for a better Bar Chart if we have enough data
  const monthlyDataMap = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, Income: 0, Expense: 0 };
    }
    if (t.type === "income") {
      acc[monthYear].Income += t.amount;
    } else {
      acc[monthYear].Expense += t.amount;
    }
    return acc;
  }, {});

  const monthlyData = Object.values(monthlyDataMap).sort((a, b) => {
    return new Date(a.month) - new Date(b.month);
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category-wise Expenses Pie Chart */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-gray-200">Expenses by Category</h2>
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
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-gray-200">Income vs Expenses (Monthly)</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData.length > 0 ? monthlyData : incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey={monthlyData.length > 0 ? "month" : "name"} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Savings</p>
          <p className={`text-2xl font-bold mt-2 ${totalIncome - totalExpense >= 0 ? "text-green-400" : "text-red-400"}`}>
            ₹{(totalIncome - totalExpense).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Expense Ratio</p>
          <p className="text-2xl font-bold mt-2 text-blue-400">
            {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Top Category</p>
          <p className="text-2xl font-bold mt-2 text-purple-400">
            {categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0].name : "N/A"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
