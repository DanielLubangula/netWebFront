import React from "react";

interface Player {
  userId: { _id: string };
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
}

interface PlayersStatusProps {
  players: Player[];
  playerAnswers: { [key: string]: { answer: number; time: number }[] };
  currentQuestionIndex: number;
  calculateScore: (playerId: string) => { score: number; correctAnswers: number };
}

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://netwebback.onrender.com${url}`;
}

export const PlayersStatus: React.FC<PlayersStatusProps> = ({
  players,
  playerAnswers,
  currentQuestionIndex,
  calculateScore,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
      {players.map((player: Player) => {
        console.log("playerAnswers  --- -", playerAnswers);
        const playerAnswer = playerAnswers[player.userId._id]?.[currentQuestionIndex];
        const hasAnswered = playerAnswer !== null && playerAnswer !== undefined;
        // console.log("Player Answer: ", playerAnswer);
        // console.log("player.userId: ", player.userId);
        const currentScore = calculateScore(player.userId._id);

        return (
          <div
            key={player.userId._id}
            className={`flex items-center p-2 sm:p-3 rounded-lg border ${
              hasAnswered ? "border-green-500" : "border-gray-700"
            } bg-gray-800 min-w-0`}
          >
            <img
              src={getCleanImageUrl(player.profilePicture)}
              alt={player.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 mr-2 sm:mr-3 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm sm:text-base truncate mr-2">{player.username}</p>
                <span className="font-bold text-sm sm:text-lg flex-shrink-0">{currentScore.score} pts</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span className="truncate">Niv. {player.level}</span>
                <span className="flex-shrink-0 ml-2">
                  {hasAnswered ? (
                    <span className="text-green-500">Répondu</span>
                  ) : (
                    <span className="text-yellow-500">En attente...</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};