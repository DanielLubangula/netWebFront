import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  isVisible: boolean;
  username: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ isVisible, username }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-lg p-4 w-full max-w-xs z-50"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="text-sm font-bold">Défi envoyé avec succès !</h3>
            <p className="text-xs text-gray-400">
              Votre défi a été envoyé à <span className="font-bold">{username}</span>.
            </p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);