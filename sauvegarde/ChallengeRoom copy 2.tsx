import React, { useState, useEffect, useRef } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { HeaderBar } from "./HeaderBar";
import { PlayersStatus } from "./PlayersStatus";
import { QuestionDisplay } from "./QuestionDisplay";
import { ResultsDisplay } from "./ResultsDisplay";
import { LeaveConfirmation } from "./LeaveConfirmation";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [playerAnswers, setPlayerAnswers] = useState<{ [key: string]: { answer: number; time: number }[] }>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "finished" | "abandoned">("waiting");
  const [calculatedScores, setCalculatedScores] = useState<{ [key: string]: { score: number; correctAnswers: number } }>({});
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  currentQuestionIndexRef.current = currentQuestionIndex;
  const timerRef = useRef<NodeJS.Timeout>();

  const { roomId, players, challengeData, questions } = location.state || {};
  const currentQuestion = questions?.[currentQuestionIndex];

  // Vérifier si l'utilisateur tente de revenir après avoir quitté ou actualisé
  useEffect(() => {
    const handleCheckNavigation = () => {
      const challengeAbandoned = localStorage.getItem(`challengeAbandoned_${roomId}`);
      const challengeFinished = localStorage.getItem(`challengeFinished_${roomId}`);
      const pageRefreshed = performance.navigation.type === 1;

      if (challengeAbandoned || challengeFinished || pageRefreshed) {
        localStorage.removeItem(`challengeAbandoned_${roomId}`);
        localStorage.removeItem(`challengeFinished_${roomId}`);
        navigate("/", { replace: true });
        return;
      }

      // Vérifier si l'autre joueur a quitté pendant que cette page était rafraîchie
      socket?.emit("checkChallengeStatus", { roomId }, (status: string) => {
        if (status === "finished" || status === "abandoned") {
          localStorage.setItem(`challengeFinished_${roomId}`, "true");
          navigate("/", { replace: true });
        }
      });
    };

    handleCheckNavigation();

    // Marquer que le challenge est en cours au premier rendu
    localStorage.setItem(`challengeInProgress_${roomId}`, "true");

    return () => {
      // Nettoyer seulement si le composant est démonté, pas lors d'un rafraîchissement
      if (!localStorage.getItem(`challengeRefreshed_${roomId}`)) {
        localStorage.removeItem(`challengeInProgress_${roomId}`);
      }
    };
  }, [roomId, navigate, socket]);

  // Gestion du rafraîchissement de la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameStatus === "playing") {
        // Marquer que la page est en train d'être rafraîchie
        localStorage.setItem(`challengeRefreshed_${roomId}`, "true");
        e.preventDefault();
        e.returnValue = "Si vous actualisez maintenant, vous perdrez le match par forfait. Êtes-vous sûr ?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Supprimer le marqueur de rafraîchissement une fois le composant démonté
      localStorage.removeItem(`challengeRefreshed_${roomId}`);
    };
  }, [gameStatus, roomId]);

  // Initialisation
  useEffect(() => {
    if (!roomId || !players || !challengeData || !questions) {
      setError("Données du match manquantes");
      setLoading(false);
      return;
    }

    const initializePlayerAnswers = () => {
      const initial: { [key: string]: { answer: number; time: number }[] } = {};
      players.forEach((player: Player) => {
        initial[player._id] = Array(questions.length).fill(null);
      });
      return initial;
    };

    setPlayerAnswers(initializePlayerAnswers());
    setLoading(false);
    setGameStatus("playing");

    if (socket) {
      const handlePlayerAnswered = ({ playerId, answerIndex, timeLeft }: {
        playerId: string;
        answerIndex: number;
        timeLeft: number;
      }) => {
        setPlayerAnswers((prev) => {
          const updated = { ...prev };
          updated[playerId] = [...(updated[playerId] || [])];
          updated[playerId][currentQuestionIndexRef.current] = {
            answer: answerIndex,
            time: 15 - timeLeft,
          };
          return updated;
        });
      };

      const handleForceNextQuestion = ({ newIndex }: { newIndex: number }) => {
        clearTimer();
        setCurrentQuestionIndex(newIndex);
        setTimeLeft(15);
        setSelectedAnswers({});
      };

      const handleChallengeFinished = (results: {
        [key: string]: { score: number; correctAnswers: number };
      }) => {
        setCalculatedScores(results);
        setGameStatus("finished");
        localStorage.setItem(`challengeFinished_${roomId}`, "true");
        localStorage.removeItem(`challengeInProgress_${roomId}`);
      };

      const handlePlayerLeft = () => {
        clearTimer();
        setOpponentLeft(true);
        setGameStatus("abandoned");
        localStorage.setItem(`challengeFinished_${roomId}`, "true");
        localStorage.removeItem(`challengeInProgress_${roomId}`);
      };

      socket.on("playerAnswered", handlePlayerAnswered);
      socket.on("forceNextQuestion", handleForceNextQuestion);
      socket.on("challengeFinished", handleChallengeFinished);
      socket.on("playerLeft", handlePlayerLeft);

      return () => {
        socket.off("playerAnswered", handlePlayerAnswered);
        socket.off("forceNextQuestion", handleForceNextQuestion);
        socket.off("challengeFinished", handleChallengeFinished);
        socket.off("playerLeft", handlePlayerLeft);
        clearTimer();
      };
    }
  }, [roomId, players, challengeData, questions, socket]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  // Détecter si tous les joueurs ont répondu
  useEffect(() => {
    if (gameStatus !== "playing" || !players || !playerAnswers) return;

    const allAnswered = players.every((player) => {
      const ans = playerAnswers[player._id]?.[currentQuestionIndex];
      return ans !== null && ans !== undefined;
    });

    if (allAnswered) {
      clearTimer();
      timerRef.current = setTimeout(() => moveToNextQuestion(), 1500);
    }
  }, [playerAnswers, currentQuestionIndex, players, gameStatus]);

  // Gestion du timer
  useEffect(() => {
    if (gameStatus === "playing") {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      } else {
        moveToNextQuestion();
      }
    }
    return clearTimer;
  }, [timeLeft, gameStatus]);

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setTimeLeft(15);
      setSelectedAnswers({});

      socket?.emit("nextQuestion", { roomId, currentQuestionIndex: newIndex });
    } else {
      finishChallenge();
    }
  };

  const calculateScore = (playerId: string) => {
    let score = 0;
    let correctAnswers = 0;

    if (playerAnswers[playerId] && questions) {
      playerAnswers[playerId].forEach((answer, index) => {
        if (answer && answer.answer !== undefined && questions[index]) {
          const isCorrect = answer.answer === questions[index].correct;
          if (isCorrect) {
            correctAnswers++;
            const timeBonus = Math.min(15, Math.max(0, 15 - (answer.time || 0)));
            score += 10 + timeBonus;
          }
        }
      });
    }

    return { score, correctAnswers };
  };

  const finishChallenge = () => {
    const finalScores: { [key: string]: { score: number; correctAnswers: number } } = {};
    players.forEach((player) => {
      finalScores[player._id] = calculateScore(player._id);
    });

    setCalculatedScores(finalScores);
    setGameStatus("finished");
    socket?.emit("finishChallenge", { roomId, results: finalScores });
    localStorage.setItem(`challengeFinished_${roomId}`, "true");
    localStorage.removeItem(`challengeInProgress_${roomId}`);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!socket || !currentQuestion || selectedAnswers[currentQuestion.id] !== undefined) return;

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
    // Marquer que le joueur a abandonné
    localStorage.setItem(`challengeAbandoned_${roomId}`, "true");
    
    // Calculer les scores actuels
    const finalScores: { [key: string]: { score: number; correctAnswers: number } } = {};
    players.forEach((player) => {
      finalScores[player._id] = calculateScore(player._id);
    });

    // Informer le serveur que le joueur a quitté
    socket?.emit("playerLeft", { roomId, results: finalScores });
    
    // Rediriger vers l'accueil
    navigate("/", { replace: true });
    localStorage.removeItem(`challengeInProgress_${roomId}`);
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
    <div className="min-h-screen bg-gray-900 text-white p-4 relative max-w-4xl mx-auto">
      <AnimatePresence>
        {showLeaveConfirm && (
          <LeaveConfirmation
            onCancel={() => setShowLeaveConfirm(false)}
            onConfirm={() => {
              handleAbandonMatch();
              setShowLeaveConfirm(false);
            }}
          />
        )}
      </AnimatePresence>

      {gameStatus === "abandoned" && (
        <ResultsDisplay
          players={players.filter(p => !opponentLeft)}
          challengeData={challengeData}
          questions={questions}
          calculatedScores={calculatedScores}
          onReturnHome={() => navigate("/", { replace: true })}
          isAbandoned={true}
        />
      )}

      {gameStatus === "playing" && (
        <>
          <HeaderBar
            challengeData={challengeData}
            currentQuestionIndex={currentQuestionIndex}
            questionsCount={questions.length}
            onLeave={() => setShowLeaveConfirm(true)}
          />
          <PlayersStatus
            players={players}
            playerAnswers={playerAnswers}
            currentQuestionIndex={currentQuestionIndex}
            calculateScore={calculateScore}
          />
          {currentQuestion && (
            <QuestionDisplay
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              selectedAnswers={selectedAnswers}
              onAnswerSelect={handleAnswerSelect}
            />
          )}
        </>
      )}

      {gameStatus === "finished" && (
        <ResultsDisplay
          players={players}
          challengeData={challengeData}
          questions={questions}
          calculatedScores={calculatedScores}
          onReturnHome={() => navigate("/", { replace: true })}
        />
      )}
    </div>
  );
};