import React from "react";
import { motion } from "framer-motion";
import { Trophy, AlertCircle } from "lucide-react";

interface Player {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
  userId: { _id: string; level: number };
}

interface ResultsDisplayProps {
  players: Player[];
  challengeData: {
    theme: string;
    questionCount: number;
  };
  questions: any[];
  calculatedScores: { [key: string]: { score: number; correctAnswers: number } };
  onReturnHome: () => void;
  isAbandoned?: boolean;
  winnerId?: string;
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
  // Fonction pour obtenir l'identifiant unique d'un joueur
  const getPlayerId = (player: Player): string => {
    return player._id || player.userId._id;
  };

  // Calcul des résultats avec vérification robuste
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

  // Trouver le score maximum
  const maxScore = Math.max(...playerResults.map((res) => res.score), 0);

  // Déterminer les gagnants (peut être plusieurs en cas d'égalité)
  const winners = playerResults.filter((res) => res.score === maxScore && maxScore > 0);
  const isTie = winners.length > 1;
  const allZeroScores = playerResults.every((res) => res.score === 0);

  // Utiliser winnerId s'il est fourni pour déterminer le gagnant
  const hasExplicitWinner = winnerId && !isTie && !allZeroScores;
  const explicitWinner = hasExplicitWinner 
    ? playerResults.find((res) => res.id === winnerId)
    : null;

  // Déterminer le statut de chaque joueur
  const getPlayerStatus = (playerId: string) => {
    if (allZeroScores) return "none";
    if (hasExplicitWinner) return playerId === winnerId ? "winner" : "loser";
    return winners.some((winner) => winner.id === playerId) 
      ? (isTie ? "tie" : "winner") 
      : "loser";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 rounded-lg shadow-lg p-6"
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
        <div className="flex justify-between text-sm">
          <span>Thème: {challengeData.theme}</span>
          <span>Questions: {questions.length}</span>
          <span>Durée: {Math.round((questions.length * 15) / 60)} min</span>
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
              className={`relative overflow-hidden rounded-lg p-4 bg-gradient-to-r ${bgClass} border-2`}
            >
              {(isWinner || isTied) && (
                <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold ${
                  isWinner ? "bg-yellow-500 text-black" : "bg-purple-500 text-white"
                }`}>
                  {isTied ? "ÉGALITÉ" : "GAGNANT"}
                </div>
              )}

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center">
                  <img
                    src={`https://netwebback.onrender.com${player.profilePicture}`}
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

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-3 pt-3 border-t border-gray-600"
              >
                <p className={
                  isWinner ? "text-yellow-400 text-sm" : 
                  isTied ? "text-purple-400 text-sm" : 
                  "text-blue-400 text-sm"
                }>
                  {isAbandoned
                    ? `Vous avez gagné par forfait avec ${correctAnswers} bonnes réponses.`
                    : status === "winner"
                    ? `Félicitations ${player.username} ! Vous avez gagné avec ${score} points.`
                    : status === "tie"
                    ? `${player.username} termine à égalité avec ${score} points.`
                    : allZeroScores
                    ? "Match nul - aucun point marqué"
                    : `${player.username} a marqué ${score} points.`}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onReturnHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-bold"
        >
          Retour à l'accueil
        </button>
      </motion.div>
    </motion.div>
  );
};