const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Generate financial insights
// @route   POST /api/ai/insights
// @access  Private
exports.getFinancialInsights = async (req, res) => {
  const { transactions } = req.body;

  if (!transactions || transactions.length === 0) {
    return res.status(400).json({ message: "No transactions provided to analyze." });
  }

  // Fallback logic if API key is missing or is the default placeholder
  const apiKey = process.env.GEMINI_API_KEY;
  const isPlaceholder = !apiKey || apiKey === "your_gemini_api_key" || apiKey.trim() === "";

  if (isPlaceholder) {
    console.log("Valid GEMINI_API_KEY not found. Using fallback insights.");
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    let insights = "Here are some basic insights based on your spending habits:\n\n";
    if (balance > 0) {
      insights += `*   Great job! You've saved ₹${balance.toFixed(2)} in this period.\n`;
    } else {
      insights += `*   Wait! You've spent ₹${Math.abs(balance).toFixed(2)} more than you earned.\n`;
    }

    const expenseByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const cat = t.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += t.amount;
        return acc;
      }, {});
    
    const categories = Object.keys(expenseByCategory);
    const biggestExpense = categories.length > 0 
      ? categories.reduce((a, b) => expenseByCategory[a] > expenseByCategory[b] ? a : b) 
      : null;

    if (biggestExpense) {
      insights += `*   Your largest spending category is "${biggestExpense}". Reviewing these expenses could help you save more.\n`;
    }

    insights += "\n(Note: Connect a valid Gemini API key to get detailed AI-powered advice!)";

    return res.json({ insights });
  }

  // Logic to use Gemini API if key is present
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const formattedTransactions = transactions.map(t => 
        `- ${t.type} of ₹${t.amount} in category '${t.category}' on ${new Date(t.date).toLocaleDateString()}`
    ).join('\n');

    const prompt = `
      You are an expert financial advisor named 'Fin-Pal'.
      Analyze the following user transactions and provide actionable financial insights.
      The user wants to understand their spending habits and find ways to save money.

      Your response must be structured in three parts:
      1.  **Spending Overview:** A brief, one-sentence summary of the user's main spending category.
      2.  **Actionable Insights:** Provide 2-3 clear, bulleted, actionable suggestions for improvement.
      3.  **Positive Encouragement:** End with a short, encouraging sentence.

      Keep the entire response concise, friendly, and easy to understand.

      Here are the transactions:
      ${formattedTransactions}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insights = response.text();

    res.json({ insights });

  } catch (err) {
    console.error("Gemini API Error:", err.message);
    if (err.message.includes("API key not valid")) {
        return res.status(500).json({ message: "AI service is not configured correctly. Please check the API key." });
    }
    res.status(500).json({ message: "Failed to generate AI insights from the service. Please try again later." });
  }
};
