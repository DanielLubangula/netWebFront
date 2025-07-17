import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, Loader2, Trophy } from "lucide-react";

interface Player {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
}

interface ChallengeData {
  theme: string;
  questionCount: number;
}

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const ChallengeRoom: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = getSocket();

  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [playerAnswers, setPlayerAnswers] = useState<{ [key: string]: { answer: number; time: number }[] }>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "finished">("waiting");
  const [results, setResults] = useState<{ [key: string]: { score: number; correctAnswers: number } }>({});

  // Données du défi
  const { roomId, players, challengeData, message, questions } = location.state || {};
  const currentQuestion = questions?.[currentQuestionIndex];

  // Initialisation
  useEffect(() => {
    if (!roomId || !players || !challengeData || !questions) {
      setError("Les données du match sont manquantes");
      setLoading(false);
      return;
    }

    // Initialisation des réponses des joueurs
    const initialPlayerAnswers: { [key: string]: { answer: number; time: number }[] } = {};
    players.forEach((player: Player) => {
      initialPlayerAnswers[player._id] = Array(questions.length).fill(null);
    });
    setPlayerAnswers(initialPlayerAnswers);
    setLoading(false);
    setGameStatus("playing");

    // Configuration des écouteurs Socket.io
    if (socket) {
      socket.on("playerAnswered", (data: { playerId: string; answerIndex: number; timeLeft: number }) => {
        setPlayerAnswers(prev => {
          const newAnswers = { ...prev };
          if (!newAnswers[data.playerId]) {
            newAnswers[data.playerId] = Array(questions.length).fill(null);
          }
          newAnswers[data.playerId] = [...newAnswers[data.playerId]];
          newAnswers[data.playerId][currentQuestionIndex] = {
            answer: data.answerIndex,
            time: 15 - data.timeLeft
          };
          return newAnswers;
        });

        checkAllPlayersAnswered();
      });

      socket.on("challengeFinished", (finalResults: { [key: string]: { score: number; correctAnswers: number } }) => {
        setResults(finalResults);
        setGameStatus("finished");
      });

      return () => {
        socket.off("playerAnswered");
        socket.off("challengeFinished");
      };
    }
  }, []);

  // Gestion du timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && gameStatus === "playing") {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameStatus === "playing") {
      moveToNextQuestion();
    }

    return () => clearTimeout(timer);
  }, [timeLeft, timerActive, gameStatus]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!socket || !currentQuestion) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex,
    }));

    socket.emit("answerQuestion", {
      roomId,
      questionId: currentQuestion.id,
      answerIndex,
      timeLeft,
    });

    setTimerActive(false);
  };

  const checkAllPlayersAnswered = () => {
    console.log("players :", players);
    console.log("playerAnswers :", playerAnswers);
    console.log("currentQuestionIndex :", currentQuestionIndex);
  
    const allAnswered = players.every(player => {
        console.log(`Réponses pour le joueur ${player._id}:`, playerAnswers[player._id]);
        console.log(`Réponse pour la question ${currentQuestionIndex}:`, playerAnswers[player._id]?.[currentQuestionIndex]);
    
      return playerAnswers[player._id]?.[currentQuestionIndex] !== null && 
             playerAnswers[player._id]?.[currentQuestionIndex] !== undefined;
    });

    console.log("", allAnswered)

    if (allAnswered) {
      setTimeout(moveToNextQuestion, 1500);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(15);
      setTimerActive(true);
      setSelectedAnswers({});
    } else {
      setGameStatus("finished");
      if (socket) {
        const scores: { [key: string]: { score: number; correctAnswers: number } } = {};
        players.forEach(player => {
          scores[player._id] = calculateScore(player._id);
        });
        socket.emit("finishChallenge", { roomId, results: scores });
      }
    }
  };

  const calculateScore = (playerId: string) => {
    let score = 0;
    let correctAnswers = 0;
    
    playerAnswers[playerId]?.forEach((answer, index) => {
      if (answer && answer.answer === questions[index].correct) {
        correctAnswers++;
        score += 10 + (15 - answer.time);
      }
    });

    return { score, correctAnswers };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <NavLink to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
        ← Retour à l'accueil
      </NavLink>

      {/* En-tête */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
        <h1 className="text-xl font-bold text-center">Défi : {challengeData.theme}</h1>
        <p className="text-center text-gray-400">{message}</p>
        
        <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
          <motion.div 
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-right mt-1 text-gray-400">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </p>
      </div>

      {/* Écran de jeu */}
      {gameStatus === "playing" && currentQuestion && (
        <div className="space-y-6">
          {/* Timer */}
          <div className="flex justify-center">
            <div className={`flex items-center px-4 py-2 rounded-full ${
              timeLeft <= 5 ? "bg-red-800" : "bg-gray-800"
            }`}>
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
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === index;
                const isCorrect = index === currentQuestion.correct;
                
                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !selectedAnswers[currentQuestion.id] && handleAnswerSelect(index)}
                    disabled={!!selectedAnswers[currentQuestion.id]}
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

          {/* Statut des joueurs */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-md font-bold mb-3">Statut des joueurs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player: Player) => {
                const hasAnswered = playerAnswers[player._id]?.[currentQuestionIndex] !== undefined &&
                                  playerAnswers[player._id]?.[currentQuestionIndex] !== null;
                
                return (
                  <div key={player._id} className="flex items-center bg-gray-700 p-3 rounded-lg">
                    <img
                      src={`https://netwebback.onrender.com${player.profilePicture}`}
                      alt={player.username}
                      className="w-10 h-10 rounded-full border-2 border-blue-500 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold">{player.username}</p>
                        <div className="flex items-center">
                          {hasAnswered ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1 animate-pulse" />
                          )}
                          <span className="text-xs text-gray-400 ml-1">
                            {hasAnswered ? "Répondu" : "En cours..."}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Niveau {player.level}</span>
                        <span>
                          Score: {calculateScore(player._id).score}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Écran des résultats */}
      {gameStatus === "finished" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            Résultats finaux
          </h2>
          
          <div className="space-y-4 mb-6">
            {players.map((player: Player) => (
              <div key={player._id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={`https://netwebback.onrender.com${player.profilePicture}`}
                      alt={player.username}
                      className="w-12 h-12 rounded-full border-2 border-blue-500 mr-4"
                    />
                    <div>
                      <p className="font-bold">{player.username}</p>
                      <p className="text-sm text-gray-400">Niveau {player.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {results[player._id]?.score || 0} points
                    </p>
                    <p className="text-sm text-gray-400">
                      {results[player._id]?.correctAnswers || 0}/{questions.length} bonnes réponses
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-bold"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      )}
    </div>
  );
};