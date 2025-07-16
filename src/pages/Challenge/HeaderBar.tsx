import React from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

interface ChallengeData {
  theme: string;
  questionCount: number;
}

interface HeaderBarProps {
  challengeData: ChallengeData;
  currentQuestionIndex: number;
  questionsCount: number;
  onLeave: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  challengeData,
  currentQuestionIndex,
  questionsCount,
  onLeave,
}) => {
  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <button
          onClick={onLeave}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          <Home className="h-5 w-5 mr-1" />
          Accueil
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold">{challengeData.theme}</h1>
          <div className="flex items-center justify-center mt-1">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1}/{questionsCount}
            </span>
          </div>
        </div>
        
        <div className="w-24"></div> {/* Spacer for alignment */}
      </header>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <motion.div
          className="bg-blue-600 h-2 rounded-full"
          animate={{
            width: `${((currentQuestionIndex + 1) / questionsCount) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </>
  );
};