import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChallengeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  themes: string[];
  theme: string;
  setTheme: (theme: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChallengeDrawer: React.FC<ChallengeDrawerProps> = ({
  isOpen,
  onClose,
  themes,
  theme,
  setTheme,
  questionCount,
  setQuestionCount,
  onSubmit
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 right-0 w-full max-w-md h-full bg-gray-800 border-l border-gray-700 z-50 shadow-lg flex flex-col p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Paramètres du match</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Thème</label>
            <select
              className="w-full p-2 bg-gray-700 text-white rounded"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
            >
              <option value="" disabled>
                Sélectionnez un thème
              </option>
              {themes.map((themeName) => (
                <option key={themeName} value={themeName}>
                  {themeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Nombre de questions</label>
            <input
              type="number"
              min={3}
              max={20}
              className="w-full p-2 bg-gray-700 text-white rounded"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(3, Math.min(20, Number(e.target.value))))}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium mt-4 transition-colors"
          >
            Envoyer le match
          </button>
        </form>
      </motion.div>
    )}
  </AnimatePresence>
);