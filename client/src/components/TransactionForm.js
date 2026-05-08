import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TransactionForm = ({
  onClose,
  addTransaction,
  updateTransaction,
  editTransaction,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount,
        type: editTransaction.type,
        category: editTransaction.category,
        date: new Date(editTransaction.date).toISOString().split("T")[0],
        notes: editTransaction.notes || "",
      });
    } else {
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [editTransaction]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.amount || !formData.category || !formData.date) {
      setError("Amount, category, and date are required.");
      return;
    }

    try {
      if (editTransaction) {
        await updateTransaction(editTransaction._id, formData);
        setSuccess("Transaction updated successfully!");
      } else {
        await addTransaction(formData);
        setSuccess("Transaction added successfully!");
      }

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.response?.data?.message || "Failed to save transaction.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{error}</p>}
      {success && <p className="text-green-500 text-sm bg-green-500/10 p-2 rounded">{success}</p>}
      
      <input
        name="amount"
        type="number"
        placeholder="Amount"
        className="w-full p-2 rounded bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <select
        name="type"
        className="w-full p-2 rounded bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        value={formData.type}
        onChange={handleChange}
        required
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input
        name="category"
        placeholder="Category"
        className="w-full p-2 rounded bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        value={formData.category}
        onChange={handleChange}
        required
      />
      <input
        name="date"
        type="date"
        className="w-full p-2 rounded bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <textarea
        name="notes"
        placeholder="Notes (Optional)"
        className="w-full p-2 rounded bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
        value={formData.notes}
        onChange={handleChange}
      />
      <div className="flex gap-4 pt-2">
        <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-gray-600 hover:bg-gray-500 p-2 rounded w-full"
            type="button"
            onClick={onClose}
        >
            Cancel
        </motion.button>
        <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-500 p-2 rounded w-full"
            type="submit"
        >
            {editTransaction ? "Update" : "Add Transaction"}
        </motion.button>
      </div>
    </form>
  );
};

export default TransactionForm;
