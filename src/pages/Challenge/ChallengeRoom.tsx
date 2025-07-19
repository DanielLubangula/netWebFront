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
import { useAuth } from "../../context/AuthContext";
import { MatchStatus } from "../../types/match";

interface Player {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
}

interface ChallengeData {
  theme: string;
  questionCount: number;
  fromUser?: {
    username: string;
    profilePicture: string;
    id: string;
    level: number;
  };
}

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface PlayerAnswer {
  answer: number;
  time: number;
}

interface PlayerScore {
  score: number;
  correctAnswers: number;
}

export const ChallengeRoom: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = getSocket();

  const [loading, setLoading] = useState(true);
  const [refresh, SetRefresh] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [playerAnswers, setPlayerAnswers] = useState<{
    [key: string]: PlayerAnswer[];
  }>({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStatus, setGameStatus] = useState<MatchStatus>("waiting");
  const [calculatedScores, setCalculatedScores] = useState<{
    [key: string]: PlayerScore;
  }>({});
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [playerRefresh, setPlayerRefresh] = useState<any>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [blockTime, setblockTime] = useState(false)

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  currentQuestionIndexRef.current = currentQuestionIndex;
  const timerRef = useRef<NodeJS.Timeout>();

  let {
    roomId,
    players: initialPlayers,
    challengeData,
    questions: initialQuestions,
  } = location.state || {};
  const [players, setPlayers] = useState<Player[]>(initialPlayers || []);
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions || []
  );
  const currentQuestion = questions?.[currentQuestionIndex];

  // Fonction pour reconstruire challengeData si undefined
  const getChallengeData = (matchData: any): ChallengeData => {
    if (challengeData) return challengeData;

    // Si challengeData n'est pas défini, le reconstruire à partir des données du match
    const opponent = matchData.players.find((p: any) => p.userId !== user?.id);

    return {
      theme: matchData.theme,
      questionCount: matchData.questions?.length || 0,
      fromUser: opponent
        ? {
            username: opponent.username,
            profilePicture: opponent.profilePicture,
            id: opponent.userId,
            level: opponent.level,
          }
        : undefined,
    };
  };

  // Fonction pour formater les scores selon le modèle demandé
  const formatScores = (playersData: any[]): { [key: string]: PlayerScore } => {
    const formattedScores: { [key: string]: PlayerScore } = {};

    // console.log("FormatScore - player : ", playersData);
    playersData.forEach((player) => {
      formattedScores[player.userId._id || player.userId] = {
        score: player.score || 0,
        correctAnswers: player.correctAnswers || 0,
      };
    });

    return formattedScores;
  };

  // Vérifier l'état du match au chargement
  useEffect(() => {
    const checkMatchStatus = async () => {
      try {
        if (!location.state) {
          const path = location.pathname.split("/")[3];
          roomId = path;
        }

        if (!roomId) {
          setError("Identifiant de match manquant");
          setLoading(false);
          return;
        }

        // Vérifier si le match existe et son état
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';  
        const response = await fetch(
          `${API_BASE_URL}/api/matches/${roomId}`
        );
        const data = await response.json();
        console.log("DAta", data);

        if (!response.ok) {
          setError(data.message || "Erreur lors de la vérification du match");
          setLoading(false);
          navigate("/");
          return;
        }

        // Vérifier si l'utilisateur est un joueur ou spectateur
        let isUserPlayer = false
        
        data.players.map( (i)=> {
          // console.log(user?.id , "-", i.userId._id.trim())
          if(i.userId._id === user?.id){
            isUserPlayer = true
          }
        })
        console.log(" -- -isUserPlayer  -- -", isUserPlayer)
        setIsSpectator(!isUserPlayer);

        // Si spectateur, rejoindre la room
        if (!isUserPlayer && socket) {
          socket.emit("joinAsSpectator", { roomId });
        }

        setMatchDetails(data);
        setPlayerRefresh(data.players);

        // Reconstruire challengeData si nécessaire
        if (!challengeData) {
          challengeData = getChallengeData(data);
        }

        // console.log("data.status ---- :", data.status);
        // Si le match est déjà terminé ou abandonné
        if (data.status === "completed" || data.status === "abandoned") {
          setGameStatus(data.status === "completed" ? "finished" : "abandoned");

          // Récupérer les scores directement du serveur
          setCalculatedScores(formatScores(data.players));
          setQuestions(data.questions);
          setLoading(false);
          return;
        }

        // Si le match est en cours
        if (data.status === "in_progress") {
          setPlayers(data.players.map((p: any) => p));
          setQuestions(data.questions);

          // Initialiser les réponses des joueurs
          const answers: { [key: string]: PlayerAnswer[] } = {};
          data.players.forEach((player: any) => {
            answers[player.userId] = Array(data.questions.length).fill(null);
            player.answers.forEach((answer: any) => {
              answers[player.userId][answer.questionId - 1] = {
                answer: answer.answerIndex,
                time: answer.timeTaken,
              };
            });
          });

          setPlayerAnswers(answers);
          setGameStatus("playing");
        }

        setLoading(false);
      } catch (err) {
        console.error("Erreur vérification match:", err);
        setError("Erreur de connexion au serveur");
        setLoading(false);
        navigate("/");
      }
    };

    checkMatchStatus();
  }, [roomId, navigate, refresh]);

  // Gestion des événements Socket.io
  useEffect(() => {
    if (!socket || !roomId) return;

    const handlePlayerAnswered = ({
      playerId,
      answerIndex,
      timeLeft,
    }: {
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
      setblockTime(false)
      clearTimer();
      setCurrentQuestionIndex(newIndex);
      setTimeLeft(15);
      setSelectedAnswers({});
    };

    const handleChallengeFinished = (results: {
      [key: string]: PlayerScore;
    }) => {
      console.log("Challenge finished:", results);
      SetRefresh(true);
      if (results == undefined) {
        console.log("Results is undefined, reloading page");
        return window.location.reload();
      }

      setCalculatedScores(formatScores(results.players));
      setGameStatus("finished");

      // Mettre à jour les réponses des joueurs

      setCurrentQuestionIndex(0);
      setTimeLeft(15);
      

      // setCurrentQuestionIndex(0)
    };

    const handlePlayerLeft = () => {
      clearTimer();
      setOpponentLeft(true);
      SetRefresh(true);
      setGameStatus("abandoned");
      // Réinitialiser l'état du jeu
      setCurrentQuestionIndex(0);
      setTimeLeft(15);
  
    };

    const handleMatchTimeout = () => {
      setGameStatus("abandoned");
      setOpponentLeft(true);
      SetRefresh(true);

      // Réinitialiser l'état du jeu
       setCurrentQuestionIndex(0);
      setTimeLeft(15);
    
    }; 

    const handleSpectatorCount = ({ count }: { count: number }) => {
      setSpectatorCount(count);
      console.log('spectateur :', count)
    };

    socket.on("playerAnswered", handlePlayerAnswered);
    socket.on("forceNextQuestion", handleForceNextQuestion);
    socket.on("challengeFinished", handleChallengeFinished);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("spectatorCount", handleSpectatorCount);
    socket.on("matchTimeout", handleMatchTimeout);

    return () => {
      socket.off("playerAnswered", handlePlayerAnswered);
      socket.off("forceNextQuestion", handleForceNextQuestion);
      socket.off("challengeFinished", handleChallengeFinished);
      socket.off("playerLeft", handlePlayerLeft);
      socket.off("matchTimeout", handleMatchTimeout);
      socket.off("spectatorCount", handleSpectatorCount);
      clearTimer();
    };
  }, [socket, roomId]);

  // Gestion du rafraîchissement de page
  useEffect(() => {
    const handleUnload = () => {
      if (gameStatus === "playing" && socket && roomId) {
        // Envoi immédiat de l'abandon au serveur
        socket.emit("playerLeft", { roomId });
      }
    };

    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [gameStatus, socket, roomId]);

  // Gestion du timer
  useEffect(() => {
    if (gameStatus === "playing" && !blockTime) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(
          () => setTimeLeft((prev) => prev - 1),
          1000
        );
      } else {
        moveToNextQuestion();
      }
    }
    return () => clearTimer();
  }, [timeLeft, gameStatus, blockTime]);

  // si blockTime est égal à true bloqué le timer juste pour cette fois

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const moveToNextQuestion = () => {
    console.log('currentQuestionIndex : ', currentQuestionIndex)
    console.log('questions.length - 1 : ', questions.length - 1)
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setTimeLeft(15);
      setSelectedAnswers({});
      socket?.emit("answerQuestion", { roomId, questionId : currentQuestion.id, timeLeft : 15, answerIndex : 1000 });
    } else {
      finishChallenge();
    }
  };
// "answerQuestion", {
//       roomId,
//       questionId: currentQuestion.id,
//       answerIndex,
//       timeLeft,
//     }
  const calculateScore = (playerId: string) => {
    let score = 0;
    let correctAnswers = 0;

    if (playerAnswers[playerId] && questions) {
      playerAnswers[playerId].forEach((answer, index) => {
        if (answer && answer.answer !== undefined && questions[index]) {
          const isCorrect = answer.answer === questions[index].correct;
          if (isCorrect) {
            correctAnswers++;
            const timeBonus = Math.min(
              15,
              Math.max(0, 15 - (answer.time || 0))
            );
            score += 10 + timeBonus;
          }
        }
      });
    }

    return { score, correctAnswers };
  };

  const finishChallenge = () => {
    const finalScores: { [key: string]: PlayerScore } = {};
    players.forEach((player) => {
      finalScores[player.userId] = calculateScore(player.userId);
    });

    socket?.emit("finishChallenge", { roomId });
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

    setblockTime(true)
  //   console.log(' ----------------')
  // console.log(roomId)
  // console.log(currentQuestion.id)
  // console.log(answerIndex)
  // console.log(timeLeft)
  //   console.log(' ----------------')
    socket.emit("answerQuestion", {
      roomId,
      questionId: currentQuestion.id,
      answerIndex,
      timeLeft,
    });
  };

  const handleAbandonMatch = () => {
    socket?.emit("playerLeft", { roomId });
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

  // Reconstruire challengeData si nécessaire avant le rendu
  const finalChallengeData =
    challengeData || (matchDetails ? getChallengeData(matchDetails) : null);

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
          players={players.filter(
            (p) => !opponentLeft || p.userId === user?.id
          )}
          challengeData={finalChallengeData}
          questions={questions}
          calculatedScores={calculatedScores}
          onReturnHome={() => navigate("/", { replace: true })}
          isAbandoned={true}
          abandonedByOpponent={opponentLeft}
        />
      )}

      {gameStatus === "playing" && (
        <>
          <HeaderBar
            challengeData={finalChallengeData}
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
              isSpectator={isSpectator}
            />
          )}
        </>
      )}

      {gameStatus === "finished" && (
        <ResultsDisplay
          players={
            playerRefresh
            // players && players.length > 0 ? players : playerRefresh
          }
          challengeData={finalChallengeData}
          questions={questions}
          calculatedScores={calculatedScores}
          onReturnHome={() => navigate("/", { replace: true })}
          winnerId={matchDetails?.winner}
        />
      )}
    </div>
  );
};
