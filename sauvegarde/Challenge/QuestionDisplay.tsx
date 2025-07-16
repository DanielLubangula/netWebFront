import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuestionDisplayProps {
  currentQuestion: Question;
  timeLeft: number;
  selectedAnswers: { [key: string]: number };
  onAnswerSelect: (answerIndex: number) => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  currentQuestion,
  timeLeft,
  selectedAnswers,
  onAnswerSelect,
}) => {
  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="flex justify-center">
        <div
          className={`flex items-center px-4 py-2 rounded-full ${
            timeLeft <= 5 ? "bg-red-800" : "bg-gray-800"
          }`}
        >
          <Clock className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="font-bold">{timeLeft}s</span>
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h2 className="text-lg font-bold mb-4">{currentQuestion.question}</h2>

        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.id] === index;
            const isCorrect = index === currentQuestion.correct;
            const showResult = selectedAnswers[currentQuestion.id] !== undefined;

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAnswerSelect(index)}
                disabled={selectedAnswers[currentQuestion.id] !== undefined}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  isSelected
                    ? isCorrect
                      ? "bg-green-600"
                      : "bg-red-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center">
                  {isSelected && (
                    isCorrect ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 mr-2" />
                    )
                  )}
                  {option}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};