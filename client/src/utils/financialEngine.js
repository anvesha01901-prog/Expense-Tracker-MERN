export const formatCurrency = (value = 0) =>
  `\u20B9${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const toNumber = (value) => Number(value || 0);

const isSameMonth = (date, month) => {
  if (!date || !month) return false;
  return new Date(date).toISOString().slice(0, 7) === month;
};

const getMonthsBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff) || diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30.44)));
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const getMonthlySubscriptionCost = (subscription) => {
  const amount = toNumber(subscription?.amount);
  return subscription?.billingCycle === "yearly" ? amount / 12 : amount;
};

export const getDaysUntil = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getRenewalAlert = (date) => {
  const days = getDaysUntil(date);
  if (Number.isNaN(days)) return null;
  if (days < 0) return { label: "Renewal date passed", tone: "rose", days };
  if (days === 0) return { label: "Renews Today", tone: "amber", days };
  if (days === 1) return { label: "Renews Tomorrow", tone: "amber", days };
  if (days === 3) return { label: "Renews in 3 Days", tone: "blue", days };
  if (days <= 7) return { label: "Renews This Week", tone: "blue", days };
  return null;
};

const getBudgetMessage = (usagePercentage, exceededBy) => {
  if (exceededBy > 0) return `Budget exceeded by ${formatCurrency(exceededBy)}`;
  if (usagePercentage >= 80) return "80% budget used";
  return "Budget Healthy";
};

const buildBudgetInsights = ({ budgets, transactions, month }) =>
  budgets.map((budget) => {
    const assigned = toNumber(budget.amount);
    const transactionSpend = transactions
      .filter((transaction) => transaction.type === "expense")
      .filter((transaction) => transaction.category === budget.category)
      .filter((transaction) => isSameMonth(transaction.date, month))
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
    const spent = budget.spent !== undefined && budget.spent !== null ? toNumber(budget.spent) : transactionSpend;
    const remaining = assigned - spent;
    const usagePercentage = assigned > 0 ? (spent / assigned) * 100 : 0;
    const exceededBy = Math.max(spent - assigned, 0);

    return {
      ...budget,
      assigned,
      spent,
      remaining,
      usagePercentage,
      exceededBy,
      message: getBudgetMessage(usagePercentage, exceededBy),
      status: exceededBy > 0 ? "danger" : usagePercentage >= 80 ? "warning" : "healthy",
    };
  });

const buildGoalInsights = ({ goals, monthlySurplus }) =>
  goals.map((goal) => {
    const target = toNumber(goal.targetAmount);
    const saved = toNumber(goal.currentAmount);
    const remaining = Math.max(target - saved, 0);
    const progressPercentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
    const achieved = progressPercentage >= 100;
    const monthsToDeadline = goal.deadline ? getMonthsBetween(new Date(), goal.deadline) : null;
    const monthlySavingsNeeded = remaining > 0 && monthsToDeadline ? remaining / monthsToDeadline : 0;
    const surplusCompletionMonths = remaining > 0 && monthlySurplus > 0 ? Math.ceil(remaining / monthlySurplus) : null;
    const estimatedCompletionDate = achieved
      ? goal.updatedAt || goal.deadline || goal.createdAt || new Date()
      : surplusCompletionMonths
        ? addMonths(new Date(), surplusCompletionMonths)
        : null;

    let message = "Set a target date to estimate monthly savings.";
    if (achieved) {
      message = "Goal achieved.";
    } else if (remaining <= monthlySurplus && monthlySurplus > 0) {
      message = "Goal achievable this month.";
    } else if (monthlySavingsNeeded > 0 && monthsToDeadline) {
      message = `Save ${formatCurrency(monthlySavingsNeeded)}/month to reach this goal in ${monthsToDeadline} ${monthsToDeadline === 1 ? "month" : "months"}.`;
    } else if (remaining > 0) {
      message = `Only ${formatCurrency(remaining)} remaining.`;
    }

    return {
      ...goal,
      target,
      saved,
      remaining,
      progressPercentage,
      monthlySavingsNeeded,
      estimatedCompletionDate,
      surplusCompletionMonths,
      achieved,
      message,
    };
  });

const scoreFromRatio = (ratio) => Math.max(0, Math.min(100, ratio * 100));

const calculateHealthScore = ({ totalIncome, monthlySavings, budgetUsagePercentage, goalProgressPercentage, subscriptionIncomePercentage }) => {
  const savingsRateScore = totalIncome > 0 ? scoreFromRatio(monthlySavings / totalIncome) : 0;
  const budgetScore = budgetUsagePercentage > 100 ? 0 : 100 - Math.max(0, budgetUsagePercentage - 50);
  const goalScore = goalProgressPercentage || 0;
  const subscriptionScore = totalIncome > 0 ? Math.max(0, 100 - subscriptionIncomePercentage * 2) : 0;
  const score = Math.round(
    (savingsRateScore * 0.35) +
    (budgetScore * 0.25) +
    (goalScore * 0.2) +
    (subscriptionScore * 0.2)
  );

  return Math.max(0, Math.min(100, score));
};

const getHealthLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs Improvement";
};

const buildRecommendations = ({ transactions, subscriptions, goals, budgetInsights, totalIncome, monthlySavings, totalMonthlySubscriptionCost, subscriptionIncomePercentage }) => {
  const recommendations = [];
  const expensesByCategory = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + toNumber(transaction.amount);
      return acc;
    }, {});
  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length >= 2 && sortedCategories[0][1] > sortedCategories[1][1]) {
    recommendations.push(`${sortedCategories[0][0]} expenses are higher than ${sortedCategories[1][0]} expenses.`);
  }

  const openGoals = goals.filter((goal) => !goal.achieved && goal.remaining > 0);
  if (monthlySavings > 0 && openGoals.length > 0) {
    const priorityGoal = openGoals.sort((a, b) => a.remaining - b.remaining)[0];
    const suggestedAmount = Math.min(monthlySavings, priorityGoal.remaining);
    recommendations.push(`You can allocate ${formatCurrency(suggestedAmount)} more toward your ${priorityGoal.name} goal.`);
    if (priorityGoal.surplusCompletionMonths) {
      recommendations.push(`At your current surplus, ${priorityGoal.name} can be completed in ${priorityGoal.surplusCompletionMonths} ${priorityGoal.surplusCompletionMonths === 1 ? "month" : "months"}.`);
    }
  }

  if (monthlySavings > 0 && totalMonthlySubscriptionCost > monthlySavings * 0.15) {
    recommendations.push(`Subscriptions cost more than 15% of your monthly savings.`);
  }

  const healthyBudgetSurplus = budgetInsights.reduce((sum, budget) => sum + Math.max(budget.remaining, 0), 0);
  if (healthyBudgetSurplus > 0 && openGoals.length > 0) {
    recommendations.push(`Current budget leaves ${formatCurrency(healthyBudgetSurplus)} that could speed up goal completion.`);
  }

  if (subscriptionIncomePercentage > 0) {
    recommendations.push(`Subscriptions consume ${subscriptionIncomePercentage.toFixed(0)}% of monthly income.`);
  }

  if (recommendations.length === 0) {
    if (totalIncome === 0) {
      recommendations.push("Add income and expenses to unlock connected financial recommendations.");
    } else {
      recommendations.push("Your connected finance picture is steady. Keep reviewing new spending as it arrives.");
    }
  }

  return recommendations.slice(0, 5);
};

export const buildFinancialEngine = ({
  transactions = [],
  subscriptions = [],
  goals = [],
  budgets = [],
  month = getCurrentMonth(),
} = {}) => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const currentMonthExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => isSameMonth(transaction.date, month))
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  const totalMonthlySubscriptionCost = subscriptions.reduce((sum, subscription) => sum + getMonthlySubscriptionCost(subscription), 0);
  const availableBalance = totalIncome - totalExpenses - totalMonthlySubscriptionCost;
  const monthlySavings = Math.max(availableBalance, 0);
  const budgetInsights = buildBudgetInsights({ budgets, transactions, month });
  const totalBudgetAssigned = budgetInsights.reduce((sum, budget) => sum + budget.assigned, 0);
  const totalBudgetSpent = budgetInsights.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetUsagePercentage = totalBudgetAssigned > 0 ? (totalBudgetSpent / totalBudgetAssigned) * 100 : 0;
  const goalInsights = buildGoalInsights({ goals, monthlySurplus: monthlySavings });
  const totalGoalRemaining = goalInsights.reduce((sum, goal) => sum + goal.remaining, 0);
  const totalGoalTarget = goalInsights.reduce((sum, goal) => sum + goal.target, 0);
  const totalGoalSaved = goalInsights.reduce((sum, goal) => sum + goal.saved, 0);
  const goalProgressPercentage = totalGoalTarget > 0 ? Math.min((totalGoalSaved / totalGoalTarget) * 100, 100) : 0;
  const subscriptionIncomePercentage = totalIncome > 0 ? (totalMonthlySubscriptionCost / totalIncome) * 100 : 0;
  const renewalAlerts = subscriptions
    .map((subscription) => ({ subscription, alert: getRenewalAlert(subscription.nextDueDate) }))
    .filter((item) => item.alert);
  const upcomingRenewal = subscriptions
    .filter((subscription) => subscription.nextDueDate)
    .slice()
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))[0];
  const highestSubscription = subscriptions
    .slice()
    .sort((a, b) => getMonthlySubscriptionCost(b) - getMonthlySubscriptionCost(a))[0];
  const financialHealthScore = calculateHealthScore({
    totalIncome,
    monthlySavings,
    budgetUsagePercentage,
    goalProgressPercentage,
    subscriptionIncomePercentage,
  });
  const healthLabel = getHealthLabel(financialHealthScore);
  const recommendations = buildRecommendations({
    transactions,
    subscriptions,
    goals: goalInsights,
    budgetInsights,
    totalIncome,
    monthlySavings,
    totalMonthlySubscriptionCost,
    subscriptionIncomePercentage,
  });

  return {
    month,
    totalIncome,
    totalExpenses,
    currentMonthExpenses,
    totalMonthlySubscriptionCost,
    availableBalance,
    monthlySavings,
    totalGoalRemaining,
    totalGoalTarget,
    totalGoalSaved,
    goalProgressPercentage,
    goalInsights,
    budgetInsights,
    totalBudgetAssigned,
    totalBudgetSpent,
    budgetUsagePercentage,
    subscriptionIncomePercentage,
    renewalAlerts,
    upcomingRenewal,
    highestSubscription,
    financialHealthScore,
    healthLabel,
    recommendations,
  };
};
