import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import { getLoggedInUser } from "../services/api";
import {
  FiHome,
  FiPieChart,
  FiTarget,
  FiDollarSign,
  FiRepeat,
  FiUser,
  FiLogOut,
  FiChevronLeft,
} from "react-icons/fi";

const Sidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getLoggedInUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <FiHome />, path: "/" },
    { name: "Budgets", icon: <FiTarget />, path: "/budget" },
    { name: "Goals", icon: <FiDollarSign />, path: "/goals" },
    { name: "Subscriptions", icon: <FiRepeat />, path: "/subscriptions" },
    { name: "Analytics", icon: <FiPieChart />, path: "/analytics" },
  ];

  return (
    <>
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="User Profile">
        {user ? (
          <div className="text-center p-4">
            <div className="w-20 h-20 bg-[var(--gold)] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 text-white shadow-lg shadow-[var(--gold-soft)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xl font-semibold text-slate-900">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-6 pt-6 border-t border-[var(--border-soft)] text-left">
              <p className="text-sm text-slate-500">Account Created</p>
              <p className="text-sm text-slate-700">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600">Loading user data...</p>
        )}
      </Modal>

      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "250px" }}
        transition={{ duration: 0.3 }}
        className="h-full bg-white/90 backdrop-blur-xl border-r border-[var(--gold-soft)] p-4 flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            {!isCollapsed && <h1 className="text-xl font-bold whitespace-nowrap text-slate-900">💸 Tracker</h1>}
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-2xl hidden lg:block text-slate-500 hover:text-slate-900">
              <FiChevronLeft className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-[var(--gold)] text-white shadow-lg shadow-[var(--gold-soft)]" : "text-slate-600 hover:bg-[var(--beige)] hover:text-slate-900"
                  } ${isCollapsed ? "justify-center" : ""}`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="relative pt-4 border-t border-[var(--gold-soft)]">
          <AnimatePresence>
            {isDropdownOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 w-full mb-2 bg-white border border-[var(--gold-soft)] rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full p-3 text-sm text-slate-700 hover:bg-[var(--beige)] transition-colors"
                >
                  <FiUser className="mr-3" /> Profile
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center w-full p-3 text-sm text-slate-700 hover:bg-[var(--beige)] transition-colors"
                >
                  <FiTarget className="mr-3" /> Settings
                </button>
                <div className="border-t border-[var(--gold-soft)]"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full p-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="mr-3" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center w-full p-3 rounded-xl hover:bg-[var(--beige)] transition-all duration-200 ${
              isDropdownOpen ? "bg-[var(--beige)]" : ""
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--gold)] to-[var(--green-deep)] rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white">
              {user ? user.name.charAt(0).toUpperCase() : <FiUser />}
            </div>
            {!isCollapsed && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-900">{user ? user.name : "User"}</p>
                <p className="text-xs text-slate-500 truncate">Account Active</p>
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;