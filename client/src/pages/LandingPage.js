import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiDollarSign,
  FiHeart,
  FiShield,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

const featureCards = [
  {
    icon: FiDollarSign,
    title: "Expense & Income Tracking",
    description: "Capture every transaction and keep your cash flow clear across all categories.",
  },
  {
    icon: FiBarChart2,
    title: "Analytics & Charts",
    description: "Understand spending patterns with real-time financial summaries and visual insights.",
  },
  {
    icon: FiTarget,
    title: "Budget Management",
    description: "Set monthly spending limits and stay on top of your financial goals effortlessly.",
  },
  {
    icon: FiTrendingUp,
    title: "Savings Goals",
    description: "Track progress toward your financial milestones and stay motivated to save more.",
  },
  {
    icon: FiBriefcase,
    title: "Subscription Tracking",
    description: "Monitor recurring costs and keep an eye on unnecessary spending each month.",
  },
  {
    icon: FiHeart,
    title: "Financial Health",
    description: "Review your overall financial health and receive practical recommendations.",
  },
];

const insightHighlights = [
  "Smart monthly spending insights",
  "Personalized budget awareness",
  "Goal-based financial planning",
];

const LandingPage = () => {
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined" && token !== "null";

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-[var(--gold-soft)]/60 bg-[rgba(255,255,255,0.82)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to={isAuthenticated ? "/dashboard" : "/" } className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--gold)] text-lg font-bold text-white shadow-lg shadow-[var(--gold-soft)]">
              ₹
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-800">Expense Tracker</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="rounded-full border border-[var(--gold)]/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--gold)] hover:bg-[var(--gold-soft)]"
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:translate-y-[-1px] hover:bg-[var(--gold-deep)]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold-soft)] px-4 py-2 text-sm font-medium text-[var(--gold-deep)]">
              <FiShield className="text-base" />
              Built for modern financial clarity
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] text-slate-900 md:text-5xl lg:text-6xl">
                Smarter spending starts with a clearer plan.
              </h1>
              <p className="max-w-lg text-lg leading-8 text-slate-600">
                Organize your income, control expenses, track recurring costs, and build healthier financial habits with a clean and intelligent dashboard designed for everyday life.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:bg-[var(--gold-deep)]"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:border-[var(--gold)] hover:text-slate-900"
              >
                Existing member
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 text-sm text-slate-600">
              {insightHighlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--green-soft)]"></span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 hidden h-32 w-32 rounded-full bg-[var(--green-soft)] blur-3xl lg:block"></div>
            <div className="absolute -right-5 bottom-12 hidden h-32 w-32 rounded-full bg-[var(--gold-soft)] blur-3xl lg:block"></div>

            <div className="relative overflow-hidden rounded-[30px] border border-[var(--gold-soft)] bg-white p-4 shadow-[0_30px_80px_rgba(120,95,43,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80"
                alt="Personal finance dashboard illustration"
                className="h-[500px] w-full rounded-[24px] object-cover"
              />
            </div>

            <div className="absolute -bottom-8 left-5 rounded-2xl border border-[var(--gold-soft)] bg-white p-4 shadow-xl shadow-[rgba(120,95,43,0.12)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Monthly Savings</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">₹24,450</p>
              <p className="mt-1 text-sm text-[var(--green-deep)]">+12.8% vs last month</p>
            </div>

            <div className="absolute -right-6 top-8 rounded-2xl border border-[var(--green-soft)] bg-[var(--green-soft)]/80 p-4 shadow-xl shadow-[rgba(56,142,112,0.15)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-700">Budget Health</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">86%</p>
              <p className="mt-1 text-sm text-slate-700">On track this month</p>
            </div>
          </div>
        </section>

        <section className="bg-[var(--beige)] py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-deep)]">About the Expense Tracker</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Built to make your money decisions simpler and smarter.
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-[28px] border border-[var(--gold-soft)] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
                <p className="text-lg leading-8 text-slate-600">
                  This Expense Tracker helps you monitor your income and expenses in one place, giving you a clear overview of your monthly cash flow. It combines transaction tracking, budget awareness, savings goals, and recurring subscription monitoring so you always know where your money is going.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  "Expense tracking",
                  "Income management",
                  "Budget control",
                  "Goal-based saving",
                  "Subscription review",
                  "Financial analytics",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--gold-soft)] bg-white p-5 text-center text-base font-medium text-slate-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-deep)]">Features</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Everything you need to manage your personal finances.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-[26px] border border-[var(--gold-soft)] bg-white p-7 shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(120,95,43,0.12)]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gold-soft)] text-[var(--gold-deep)]">
                  <Icon size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-base leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--beige)] py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-deep)]">Finance in focus</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">A polished view of your financial life.</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
              ].map((src, index) => (
                <div key={src} className="overflow-hidden rounded-[24px] border border-[var(--gold-soft)] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                  <img src={src} alt="Finance representation" className="h-72 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gold-deep)]">
                      {index === 0 ? "Planning" : index === 1 ? "Insights" : "Growth"}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {index === 0 ? "Keep spending intentional." : index === 1 ? "See patterns clearly." : "Build better habits."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="rounded-[32px] border border-[var(--gold-soft)] bg-[linear-gradient(135deg,#fffaf2,#f3f9f1,#ffffff)] p-8 text-center shadow-[0_24px_60px_rgba(120,95,43,0.10)] md:p-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--gold-deep)]">Start today</p>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Turn daily spending into confident financial decisions.
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center rounded-full bg-[var(--gold)] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:bg-[var(--gold-deep)]"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:border-[var(--gold)] hover:text-slate-900"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--gold-soft)] bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-lg font-bold text-slate-900">Expense Tracker</p>
            <p className="mt-1">Simple tools for smarter financial decisions.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link to="/login" className="transition hover:text-slate-900">Login</Link>
            <Link to="/register" className="transition hover:text-slate-900">Register</Link>
            <Link to="/dashboard" className="transition hover:text-slate-900">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
