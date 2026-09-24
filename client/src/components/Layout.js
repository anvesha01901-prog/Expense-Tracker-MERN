import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiMenu } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[var(--page-bg)] text-slate-800">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar onLogout={handleLogout} />
      </div>

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden"
            >
              <Sidebar onLogout={handleLogout} />
            </motion.div>
            <div
              className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-[var(--gold-soft)] flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-900">💸 Tracker</h1>
          <button onClick={() => setIsMobileSidebarOpen(true)} className="text-slate-700">
            <FiMenu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-[var(--page-bg)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
