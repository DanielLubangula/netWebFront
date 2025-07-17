import React, { useState, useEffect, useRef } from "react";
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
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [playerAnswers, setPlayerAnswers] = useState<{
    [key: string]: { answer: number; time: number }[];
  }>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "playing" | "finished"
  >("waiting");
  const [results, setResults] = useState<{
    [key: string]: { score: number; correctAnswers: number };
  }>({});
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [calculatedScores, setCalculatedScores] = useState<{
    [key: string]: { score: number; correctAnswers: number };
  }>({});

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  currentQuestionIndexRef.current = currentQuestionIndex;
  const timerRef = useRef<NodeJS.Timeout>();

  // Données du défi
  const { roomId, players, challengeData, message, questions } =
    location.state || {};
  const currentQuestion = questions?.[currentQuestionIndex];

  // Initialisation
  useEffect(() => {
    if (!roomId || !players || !challengeData || !questions) {
      setError("Les données du match sont manquantes");
      setLoading(false);
      return;
    }

    const initializePlayerAnswers = () => {
      const initialPlayerAnswers: {
        [key: string]: { answer: number; time: number }[];
      } = {};
      players.forEach((player: Player) => {
        initialPlayerAnswers[player._id] = Array(questions.length).fill(null);
      });
      return initialPlayerAnswers;
    };

    setPlayerAnswers(initializePlayerAnswers());
    setLoading(false);
    setGameStatus("playing");

    if (socket) {
      const handlePlayerAnswered = (data: {
        playerId: string;
        answerIndex: number;
        timeLeft: number;
      }) => {
        setPlayerAnswers((prev) => {
          const newAnswers = { ...prev };

          if (!newAnswers[data.playerId]) {
            newAnswers[data.playerId] = Array(questions.length).fill(null);
          }

          newAnswers[data.playerId] = [...newAnswers[data.playerId]];
          newAnswers[data.playerId][currentQuestionIndexRef.current] = {
            answer: data.answerIndex,
            time: 15 - data.timeLeft,
          };

          return newAnswers;
        });
      };

      const handleForceNextQuestion = ({ newIndex }: { newIndex: number }) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrentQuestionIndex(newIndex);
        setTimeLeft(15);
        setTimerActive(true);
        setSelectedAnswers({});
      };

      const handleChallengeFinished = (finalResults: {
        [key: string]: { score: number; correctAnswers: number };
      }) => {
        console.log("Received final results from server:", finalResults);

        // Toujours utiliser les résultats locaux comme source de vérité
        const localResults: {
          [key: string]: { score: number; correctAnswers: number };
        } = {};
        players.forEach((player) => {
          localResults[player._id] = calculateScore(player._id);
        });

        // Fusionner avec les résultats du serveur si disponibles
        const mergedResults = { ...localResults, ...finalResults };

        console.log("Merged results:", mergedResults);
        setResults(mergedResults);
        setCalculatedScores(mergedResults);
        setGameStatus("finished");
      };

      socket.on("playerAnswered", handlePlayerAnswered);
      socket.on("forceNextQuestion", handleForceNextQuestion);
      socket.on("challengeFinished", handleChallengeFinished);

      return () => {
        socket.off("playerAnswered", handlePlayerAnswered);
        socket.off("forceNextQuestion", handleForceNextQuestion);
        socket.off("challengeFinished", handleChallengeFinished);
      };
    }
  }, [roomId, players, challengeData, questions, socket]);

  // Vérification des réponses complètes
  useEffect(() => {
    if (gameStatus !== "playing" || !players || !playerAnswers) return;

    const allPlayersAnswered = players.every((player) => {
      const answer = playerAnswers[player._id]?.[currentQuestionIndex];
      return answer !== null && answer !== undefined;
    });

    if (allPlayersAnswered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const timer = setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
      timerRef.current = timer;
    }
  }, [playerAnswers, currentQuestionIndex, players, gameStatus]);

  // Gestion du timer
  useEffect(() => {
    if (timerActive && timeLeft > 0 && gameStatus === "playing") {
      timerRef.current = setTimeout(
        () => setTimeLeft((prev) => prev - 1),
        1000
      );
    } else if (timeLeft === 0 && gameStatus === "playing") {
      moveToNextQuestion();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, gameStatus]);

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setTimeLeft(15);
      setTimerActive(true);
      setSelectedAnswers({});

      if (socket) {
        socket.emit("nextQuestion", {
          roomId,
          currentQuestionIndex: newIndex,
        });
      }
    } else {
      finishChallenge();
    }
  };

  const calculateScore = (playerId: string) => {
    let score = 0;
    let correctAnswers = 0;

    console.log(`Calculating score for player: ${playerId}`);
    console.log("Player answers:", playerAnswers[playerId]);
    console.log("Questions:", questions);

    if (playerAnswers[playerId] && questions) {
      playerAnswers[playerId].forEach((answer, index) => {
        if (answer && answer.answer !== undefined && questions[index]) {
          const isCorrect = answer.answer === questions[index].correct;
          console.log(
            `Question ${index}: answer=${answer.answer}, correct=${questions[index].correct}, isCorrect=${isCorrect}`
          );

          if (isCorrect) {
            correctAnswers++;
            // Base points + time bonus (max 15)
            const timeBonus = Math.min(
              15,
              Math.max(0, 15 - (answer.time || 0))
            );
            score += 10 + timeBonus;
            console.log(
              `Correct answer! Adding ${
                10 + timeBonus
              } points (10 base + ${timeBonus} time bonus)`
            );
          }
        } else {
          console.log(
            `Skipping question ${index} - answer or question missing`
          );
        }
      });
    } else {
      console.log("Player answers or questions not available");
    }

    console.log("Final score for player", playerId, ":", {
      score,
      correctAnswers,
    });
    return { score, correctAnswers };
  };

  const finishChallenge = () => {
    console.log("Finishing challenge...");
    const finalScores: {
      [key: string]: { score: number; correctAnswers: number };
    } = {};

    players.forEach((player) => {
      console.log(`Calculating final score for player: ${player._id}`);
      finalScores[player._id] = calculateScore(player._id);
    });

    console.log("Final scores before setting state:", finalScores);
    setCalculatedScores(finalScores);
    setResults(finalScores);
    setGameStatus("finished");

    if (socket) {
      console.log("Emitting finishChallenge with scores:", finalScores);
      socket.emit("finishChallenge", {
        roomId,
        results: finalScores,
      });
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (
      !socket ||
      !currentQuestion ||
      selectedAnswers[currentQuestion.id] !== undefined
    )
      return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerIndex,
    }));

    socket.emit("answerQuestion", {
      roomId,
      questionId: currentQuestion.id,
      answerIndex,
      timeLeft,
    });
  };

  const handleAbandonMatch = () => {
    if (socket) {
      const finalScores: {
        [key: string]: { score: number; correctAnswers: number };
      } = {};
      players.forEach((player) => {
        finalScores[player._id] = calculateScore(player._id);
      });

      socket.emit("abandonChallenge", {
        roomId,
        results: finalScores,
      });
    }
    setGameStatus("finished");
    navigate("/", { replace: true });
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
    <div className="min-h-screen bg-gray-900 text-white p-4 relative">
      <AnimatePresence>
        {showLeaveConfirm && (
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
              <p className="mb-6">
                Si vous quittez maintenant, vous serez considéré comme forfait
                et votre adversaire gagnera le match.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Continuer
                </button>
                <button
                  onClick={() => {
                    handleAbandonMatch();
                    setShowLeaveConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Abandonner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {gameStatus !== "finished" && (
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
        >
          ← Retour à l'accueil
        </button>
      )}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
        <h1 className="text-xl font-bold text-center">
          Défi : {challengeData.theme}
        </h1>
        <p className="text-center text-gray-400">{message}</p>

        <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-right mt-1 text-gray-400">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </p>
      </div>
      {gameStatus === "playing" && currentQuestion && (
        <div className="space-y-6">
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

          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-lg font-bold mb-4">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected =
                  selectedAnswers[currentQuestion.id] === index;
                const isCorrect = index === currentQuestion.correct;

                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswers[currentQuestion.id] !== undefined}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isSelected
                        ? isCorrect
                          ? "bg-green-600"
                          : "bg-red-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    } ${
                      selectedAnswers[currentQuestion.id] !== undefined
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center">
                      {isSelected &&
                        (isCorrect ? (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 mr-2" />
                        ))}
                      {option}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-md font-bold mb-3">Statut des joueurs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player: Player) => {
                const playerAnswer =
                  playerAnswers[player._id]?.[currentQuestionIndex];
                const hasAnswered =
                  playerAnswer !== null && playerAnswer !== undefined;
                const currentScore = calculateScore(player._id);

                return (
                  <div
                    key={player._id}
                    className="flex items-center bg-gray-700 p-3 rounded-lg"
                  >
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
                        <span>Score: {currentScore.score}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
            {players.map((player: Player) => {
              const playerResult = calculatedScores[player._id] || {
                score: 0,
                correctAnswers: 0,
              };
              console.log(
                `Rendering results for player ${player._id}:`,
                playerResult
              );

              return (
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
                        <p className="text-sm text-gray-400">
                          Niveau {player.level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {playerResult.score} points
                      </p>
                      <p className="text-sm text-gray-400">
                        {playerResult.correctAnswers} bonnes réponses sur{" "}
                        {questions?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-bold"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      )}
    </div>
  );
};
