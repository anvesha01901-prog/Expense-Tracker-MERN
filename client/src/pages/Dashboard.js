import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getFinancialInsights, getFinancialHealthScore } from "../services/api";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [financialHealthScore, setFinancialHealthScore] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transRes, scoreRes] = await Promise.all([
        getTransactions(),
        getFinancialHealthScore(),
      ]);
      setTransactions(transRes.data);
      setFinancialHealthScore(scoreRes.data.score);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Could not load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (transactionData) => {
    await addTransaction(transactionData);
    fetchData(); // Refetch all data
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    await updateTransaction(id, transactionData);
    fetchData(); // Refetch all data
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        fetchData(); // Refetch all data
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

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

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
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const noTransactions = transactions.length === 0;

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editTransaction ? "Edit Transaction" : "Add Transaction"}>
        <TransactionForm onClose={() => setIsModalOpen(false)} addTransaction={handleAddTransaction} updateTransaction={handleUpdateTransaction} editTransaction={editTransaction} />
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-4xl font-extrabold tracking-tight">
          Dashboard
        </motion.h1>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }} 
          className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 font-semibold transition-all" 
          onClick={openAddModal}
        >
          + Add Transaction
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Balance</h2>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Income</h2>
          <p className="text-3xl font-bold text-emerald-400">₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Expense</h2>
          <p className="text-3xl font-bold text-rose-400">₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Health Score</h2>
          {financialHealthScore !== null ? (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-blue-400">{financialHealthScore}</p>
              <span className="text-xs text-gray-500 font-medium">/100</span>
            </div>
          ) : (
            <p className="text-lg font-medium text-gray-500 animate-pulse">Calculating...</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
          {noTransactions ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
              <p className="text-lg font-medium">No transactions found</p>
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
                  className="bg-gray-700/30 hover:bg-gray-700/50 p-4 rounded-xl flex justify-between items-center transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <span className="font-bold">{t.category.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-100">{t.category}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[100px]">{t.notes || 'No notes'}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(t)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => handleDeleteTransaction(t._id)} className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Distribution</h2>
          {noTransactions || categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 text-center">
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
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[10px] text-gray-400 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-3xl">✨</span> AI Financial Advisor
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl">Get personalized insights and suggestions based on your spending habits to improve your financial health.</p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }} 
            className="bg-white text-gray-900 font-bold px-8 py-3 rounded-xl shadow-xl hover:bg-gray-100 transition-colors flex items-center gap-2" 
            onClick={fetchInsights} 
            disabled={loadingInsights}
          >
            {loadingInsights ? <Spinner /> : 'Analyze My Spending'}
          </motion.button>

          {insights && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gray-900/60 p-6 rounded-xl border border-white/5 font-mono text-sm text-gray-300 leading-relaxed shadow-inner"
            >
              <p className="whitespace-pre-wrap">{insights}</p>
            </motion.div>
          )}
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full group-hover:bg-purple-600/30 transition-all duration-700"></div>
      </div>
    </div>
  );
};

export default Dashboard;
