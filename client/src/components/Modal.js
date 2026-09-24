import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(32,25,17,0.12)] w-full max-w-md relative border border-[var(--border-soft)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-soft)]">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800 rounded-full p-1 hover:bg-[var(--beige)]">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
