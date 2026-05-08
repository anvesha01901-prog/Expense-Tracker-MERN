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
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-gray-400">{user.email}</p>
            <div className="mt-6 pt-6 border-t border-gray-700 text-left">
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </Modal>

      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "250px" }}
        transition={{ duration: 0.3 }}
        className="h-full bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 p-4 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            {!isCollapsed && <h1 className="text-xl font-bold whitespace-nowrap">💸 Tracker</h1>}
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-2xl hidden lg:block text-gray-400 hover:text-white">
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
                    isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="relative pt-4 border-t border-gray-700/50">
          <AnimatePresence>
            {isDropdownOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 w-full mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full p-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <FiUser className="mr-3" /> Profile
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center w-full p-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <FiTarget className="mr-3" /> Settings
                </button>
                <div className="border-t border-gray-700"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full p-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <FiLogOut className="mr-3" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center w-full p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 ${
              isDropdownOpen ? "bg-gray-700/50" : ""
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
              {user ? user.name.charAt(0).toUpperCase() : <FiUser />}
            </div>
            {!isCollapsed && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{user ? user.name : "User"}</p>
                <p className="text-xs text-gray-400 truncate">Account Active</p>
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;