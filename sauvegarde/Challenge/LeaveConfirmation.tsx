import React from "react";
import { motion } from "framer-motion";

interface LeaveConfirmationProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const LeaveConfirmation: React.FC<LeaveConfirmationProps> = ({
  onCancel,
  onConfirm,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Quitter le match ?</h3>
        <p className="mb-6">Vous serez considéré comme forfait si vous quittez maintenant.</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Continuer
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Quitter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};