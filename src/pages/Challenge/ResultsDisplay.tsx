import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, AlertCircle, ChevronDown, ChevronUp, Check, X } from "lucide-react";

interface Player {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
  userId: { _id: string; level: number };
  answers: {
    questionId: number;
    answerIndex: number;
    timeTaken: number;
    isCorrect: boolean;
  }[];
  score: number;
  correctAnswers: number;
}

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correct: number;
  explanation: string;
}

interface ResultsDisplayProps {
  players: Player[];
  challengeData: {
    theme: string;
    questionCount: number;
  };
  questions: Question[];
  calculatedScores: { [key: string]: { score: number; correctAnswers: number } };
  onReturnHome: () => void;
  isAbandoned?: boolean;
  winnerId?: string;
}

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  players,
  challengeData,
  questions,
  calculatedScores,
  onReturnHome,
  isAbandoned = false,
  winnerId,
}) => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const getPlayerId = (player: Player): string => {
    return player._id || player.userId._id;
  };

  const playerResults = players.map((player) => {
    const playerId = getPlayerId(player);
    const result = calculatedScores[playerId] || { score: 0, correctAnswers: 0 };
    return {
      player,
      score: result.score,
      correctAnswers: result.correctAnswers,
      id: playerId,
    };
  });

  const maxScore = Math.max(...playerResults.map((res) => res.score), 0);
  const winners = playerResults.filter((res) => res.score === maxScore && maxScore > 0);
  const isTie = winners.length > 1;
  const allZeroScores = playerResults.every((res) => res.score === 0);

  const hasExplicitWinner = winnerId && !isTie && !allZeroScores;
  const explicitWinner = hasExplicitWinner 
    ? playerResults.find((res) => res.id === winnerId)
    : null;

  const getPlayerStatus = (playerId: string) => {
    if (allZeroScores) return "none";
    if (hasExplicitWinner) return playerId === winnerId ? "winner" : "loser";
    return winners.some((winner) => winner.id === playerId) 
      ? (isTie ? "tie" : "winner") 
      : "loser";
  };

  const togglePlayerDetails = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  const getAnswerForQuestion = (player: Player, questionId: number) => {
    console.log("players --- - - ", player)
    return player.answers.find(a => a.questionId === questionId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
    >
      {isAbandoned ? (
        <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          L'adversaire a quitté la partie
        </h2>
      ) : (
        <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
          {allZeroScores ? "Match terminé" : isTie ? "Égalité parfaite" : "Résultats finaux"}
        </h2>
      )}

      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-center mb-2">Résumé du match</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-gray-600 px-3 py-1 rounded-full">Thème: {challengeData.theme}</span>
          <span className="bg-gray-600 px-3 py-1 rounded-full">Questions: {questions.length}</span>
          <span className="bg-gray-600 px-3 py-1 rounded-full">Durée estimée: {Math.round((questions.length * 15) / 60)} min</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {playerResults.map(({ player, score, correctAnswers, id }) => {
          const status = getPlayerStatus(id);
          const isWinner = status === "winner";
          const isTied = status === "tie";

          const bgClass = isWinner
            ? "from-yellow-900/50 to-yellow-800/50 border-yellow-500"
            : isTied
            ? "from-purple-900/50 to-purple-800/50 border-purple-500"
            : "from-blue-900/50 to-blue-800/50 border-blue-500";

          return (
            <motion.div
              key={id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative overflow-hidden rounded-lg border-2 ${bgClass}`}
            >
              {(isWinner || isTied) && (
                <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold ${
                  isWinner ? "bg-yellow-500 text-black" : "bg-purple-500 text-white"
                }`}>
                  {isTied ? "ÉGALITÉ" : "GAGNANT"}
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center">
                    <img
                      src={getCleanImageUrl(player.profilePicture)}
                      alt={player.username}
                      className="w-12 h-12 rounded-full border-2 border-white mr-4"
                    />
                    <div>
                      <p className="font-bold">{player.username}</p>
                      <p className="text-sm text-gray-400">Niveau {player.level || player.userId.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{score} points</p>
                    <p className="text-sm text-gray-400">
                      {correctAnswers}/{questions.length} bonnes réponses
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => togglePlayerDetails(id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {expandedPlayer === id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Masquer les détails
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Voir les détails des réponses
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {expandedPlayer === id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-600 p-4 bg-gray-900/50">
                      <h4 className="font-bold mb-3 text-center">Détail des réponses</h4>
                      <div className="space-y-4">
                        {questions.map((question) => {
                          const answer = getAnswerForQuestion(player, question.id);
                          const isCorrect = answer?.isCorrect ?? false;

                          return (
                            <div key={question.id} className="bg-gray-800 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 mt-1 ${
                                  isCorrect ? "text-green-500" : "text-red-500"
                                }`}>
                                  {isCorrect ? (
                                    <Check className="w-5 h-5" />
                                  ) : (
                                    <X className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{question.question}</p>
                                  {question.type !== "Libre" && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-400">Options:</p>
                                      <ul className="list-disc list-inside text-sm">
                                        {question.options?.map((option, idx) => (
                                          <li 
                                            key={idx} 
                                            className={`${
                                              idx === question.correct ? "text-green-400" :
                                              idx === answer?.answerIndex ? "text-red-400" :
                                              "text-gray-400"
                                            }`}
                                          >
                                            {option}
                                            {idx === question.correct && " (Correcte)"}
                                            {idx === answer?.answerIndex && idx !== question.correct && " (Votre réponse)"}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {question.type === "Libre" && answer && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-400">Réponse donnée:</p>
                                      <p className="text-sm">
                                        {question.options?.[answer.answerIndex] || "Aucune réponse"}
                                      </p>
                                    </div>
                                  )}
                                  <div className="mt-2 text-xs text-gray-500">
                                    <p>Temps de réponse: {answer?.timeTaken ?? 0}s</p>
                                    {question.explanation && (
                                      <p className="italic mt-1">Explication: {question.explanation}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <button
          onClick={onReturnHome}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors font-bold"
        >
          Retour à l'accueil
        </button>
      </motion.div>
    </motion.div>
  );
};