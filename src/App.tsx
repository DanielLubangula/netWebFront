import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { Quiz } from "./pages/Quiz/Quiz";
import { QuizPlay } from "./pages/Quiz/QuizPlay";
import { Leaderboard } from "./pages/Leaderboard/Leaderboard";
import { ChallengeRoom } from "./pages/Challenge/ChallengeRoom";
import { Learning } from "./pages/Learning/Learning";
import { LearningLesson } from "./pages/Learning/LearningLesson";
import { News } from "./pages/News/News";
import  NewsManager  from "./pages/Admin/NewsManager"
import { Auth } from "./pages/Auth/Auth";
import { Notifications } from "./pages/Notifications/Notifications";
import { Settings } from "./pages/Settings/Settings";
import { SettingsAdmin } from "./pages/Admin/Settings";
import { Tournament } from "./pages/Tournament/Tournament";
import { FullLeaderboard } from "./pages/Leaderboard/FullLeaderboard";
import { AllOnlinePlayers } from "./pages/Players/AllOnlinePlayers";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import { AdminLayout } from "./components/Admin/AdminLayout";
import { Dashboard } from "./pages/Admin/Dashboard";
import { Questions } from "./pages/Admin/Questions";
import { Users } from "./pages/Admin/Users";
import { Themes } from "./pages/Admin/Themes";
import { ThemeContent } from "./pages/Admin/ThemeContent";
import { PublicProfile } from "./pages/publicProfilPage/index";

import { useEffect, useState } from "react";
import { initializeSocket, disconnectSocket } from "./socket";
import { Profile } from "./pages/Profile/Profile";
import ChallengeNotification from "./components/ChallengeNotification/ChallengeNotification";
import { Socket } from "socket.io-client";
import { Erreur } from "./pages/Err/Erreur"
import { AuthProvider } from './context/AuthContext';

interface ChallengeData {
  theme: string;
  questionCount: number;
  fromUser: {
    username: string;
    profilePicture: string;
    id: string;
    level: string;
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

function App() {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [redirectToRoom, setRedirectToRoom] = useState<{
    pathname: string;
    state: {
      roomId: string;
      players: any[];
      challengeData: ChallengeData;
      message: string;
      questions: Question[];
      fromRedirect: boolean;
    };
  } | null>(null);
  const [declineMessage, setDeclineMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const initializedSocket = initializeSocket(token);
      setSocket(initializedSocket);

      initializedSocket.on("receiveChallenge", (data: { fromUserId: string; challengeData: ChallengeData }) => {
        if (data?.challengeData?.fromUser) {
          setChallengeData(data.challengeData);
        } else {
          console.error("Données de défi invalides :", data);
        }
      });

      initializedSocket.on("matchStarted", ({ roomId, players, challengeData, message, questions }) => {
        // console.log(`Match démarré dans la salle ${roomId}`);
        
        setRedirectToRoom({
          pathname: `/challenge/room/${roomId}`,
          state: { 
            roomId, 
            players, 
            challengeData, 
            message, 
            questions,
            fromRedirect: true // Ajout du flag important
          },
        });
      });

      initializedSocket.on("challengeDeclined", ({ message }) => {
        setDeclineMessage(message);
        setTimeout(() => setDeclineMessage(null), 5000);
      });

      initializedSocket.on("matchError", ({ message }) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
      });
    }

    return () => {
      if (socket) {
        disconnectSocket();
      }
    };
  }, []);

  const [challengeError, setChallengeError] = useState<string | null>(null);

  useEffect(() => {
    if (socket) {
      const handleChallengeError = ({ message }: { message: string }) => {
        setChallengeError(message);
        setTimeout(() => setChallengeError(null), 5000);
      };
      socket.on("challengeError", handleChallengeError);

      return () => {
        socket.off("challengeError", handleChallengeError);
      };
    }
  }, [socket]);

  const handleAcceptChallenge = () => {
    // console.log("accepter", socket ,"`\n", challengeData)
    if (socket && challengeData) {
      socket.emit("acceptChallenge", {
        toUserId: challengeData.fromUser.id,
        message: `Votre défi a été accepté par ${challengeData.fromUser.username}.`,
        challengeData,
      });
    }
    setChallengeData(null);
  };

  const handleDeclineChallenge = () => {
    if (socket && challengeData) {
      socket.emit("declineChallenge", {
        toUserId: challengeData.fromUser.id,
        message: `Votre défi a été refusé par ${challengeData.fromUser.username}.`,
      });
    }
    setChallengeData(null);
  };

  // Réinitialise la redirection après navigation
  useEffect(() => {
    if (redirectToRoom) {
      const timer = setTimeout(() => {
        setRedirectToRoom(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectToRoom]);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-white relative">
          <ChallengeNotification
            challengeData={challengeData}
            onAccept={handleAcceptChallenge}
            onDecline={handleDeclineChallenge}
          />

          {redirectToRoom && (
            <Navigate
              to={redirectToRoom.pathname}
              state={redirectToRoom.state}
              replace
            />
          )}

          {errorMessage && (
            <div className="fixed bottom-4 right-4 bg-red-600 text-white rounded-lg shadow-lg p-4 w-full max-w-xs z-50">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {declineMessage && (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-lg p-4 w-full max-w-xs z-50">
              <p className="text-sm">{declineMessage}</p>
            </div>
          )}

          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="quiz/play" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
              <Route path="Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="/players/online" element={<ProtectedRoute><AllOnlinePlayers /></ProtectedRoute>} />
              <Route path="leaderboard/full" element={<ProtectedRoute><FullLeaderboard /></ProtectedRoute>} />
              <Route 
                path="challenge/room/:roomId" 
                element={<ProtectedRoute><ChallengeRoom /></ProtectedRoute>} 
              />
              <Route path="learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
              <Route path="learning/lesson/:lessonId" element={<ProtectedRoute><LearningLesson /></ProtectedRoute>} />
              <Route path="news" element={<News />} />
              <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
              <Route path="*" element={<Erreur />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="questions" element={<Questions />} />
              <Route path="users" element={<Users />} />
              <Route path="themes" element={<Themes />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="News" element={<NewsManager />} />
              <Route path="questions/theme/:name" element={<ThemeContent />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;