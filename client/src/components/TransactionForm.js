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
      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 p-2 rounded-lg">{error}</p>}
      {success && <p className="text-green-700 text-sm bg-green-50 border border-green-100 p-2 rounded-lg">{success}</p>}

      <input
        name="amount"
        type="number"
        placeholder="Amount"
        className="w-full p-3 rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--gold-soft)] outline-none text-slate-800"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <select
        name="type"
        className="w-full p-3 rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--gold-soft)] outline-none text-slate-800"
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
        className="w-full p-3 rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--gold-soft)] outline-none text-slate-800"
        value={formData.category}
        onChange={handleChange}
        required
      />
      <input
        name="date"
        type="date"
        className="w-full p-3 rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--gold-soft)] outline-none text-slate-800"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <textarea
        name="notes"
        placeholder="Notes (Optional)"
        className="w-full p-3 rounded-xl bg-[var(--beige)] border border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--gold-soft)] outline-none text-slate-800"
        value={formData.notes}
        onChange={handleChange}
      />
      <div className="flex gap-4 pt-2">
        <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl w-full border border-slate-200"
            type="button"
            onClick={onClose}
        >
            Cancel
        </motion.button>
        <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--gold)] hover:bg-[var(--gold-deep)] text-white p-3 rounded-xl w-full shadow-lg shadow-[var(--gold-soft)]"
            type="submit"
        >
            {editTransaction ? "Update" : "Add Transaction"}
        </motion.button>
      </div>
    </form>
  );
};

export default TransactionForm;
