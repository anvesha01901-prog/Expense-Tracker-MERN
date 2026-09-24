import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-4 py-12 text-slate-800">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--gold-soft)] bg-white p-8 shadow-[0_25px_80px_rgba(120,95,43,0.12)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-2xl text-[var(--green-deep)]">✓</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Start building better money habits</p>
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-[var(--beige)] px-3 py-3 text-slate-800 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-[var(--beige)] px-3 py-3 text-slate-800 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-[var(--beige)] px-3 py-3 text-slate-800 outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-soft)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--gold)] px-4 py-3 font-bold text-white shadow-lg shadow-[var(--gold-soft)] transition hover:bg-[var(--gold-deep)]"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--gold-deep)] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
