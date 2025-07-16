import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Importer Navigate
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { Quiz } from "./pages/Quiz/Quiz";
import { QuizPlay } from "./pages/Quiz/QuizPlay";
import { Leaderboard } from "./pages/Leaderboard/Leaderboard";
// import { Challenge } from "./pages/Challenge/Challenge";
import { Erreur } from "./pages/Err/Erreur";
import { ChallengeRoom } from "./pages/Challenge/ChallengeRoom";
import { Learning } from "./pages/Learning/Learning";
import { LearningLesson } from "./pages/Learning/LearningLesson";
import { News } from "./pages/News/News";
import { Auth } from "./pages/Auth/Auth";
import { Notifications } from "./pages/Notifications/Notifications";
import { Settings } from "./pages/Settings/Settings";
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
import { PublicProfile } from "./pages/publicProfilPage/publicProfilPage";
import { useEffect, useState } from "react";
import { initializeSocket, disconnectSocket } from "./socket";
import { Profile } from "./pages/Profile/Profile";
import ChallengeNotification from "./components/ChallengeNotification/ChallengeNotification"; // Import du composant
import { Socket } from "socket.io-client"; // Importer le type Socket

// Définir le type pour les données de défi
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

function App() {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null); // Utiliser Socket comme type
  const [matchDetails, setMatchDetails] = useState<{
    roomId: string;
    players: string[];
    challengeData: ChallengeData;
    message: string;
  } | null>(null); // État pour les détails du match
  const [declineMessage, setDeclineMessage] = useState<string | null>(null); // État pour le message de refus
  const [redirectToRoom, setRedirectToRoom] = useState<string | null>(null); // État pour gérer la redirection

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const initializedSocket = initializeSocket(token);
      setSocket(initializedSocket);

      // Écoute globale : défi reçu
      initializedSocket.on("receiveChallenge", (data: { fromUserId: string; challengeData: ChallengeData }) => {
        if (data && data.challengeData && data.challengeData.fromUser) {
          setChallengeData(data.challengeData); // Stocker les données du défi
        } else {
          console.error("Données de défi invalides :", data);
        }
      });

      // Écoute globale : défi accepté
      initializedSocket.on("matchStarted", ({roomId, players, challengeData, message, questions}) => {
        setMatchDetails({ roomId, players, challengeData, message }); // Stocker les détails du match
        console.log("🎮 Match lancé dans", roomId);
        console.log("👥 Joueurs :", players);
        console.log("📋 Questions :", questions);

        // Définir la redirection vers la salle de défi
        setRedirectToRoom(`/challenge/room/${roomId}`);
      });

      // Écoute globale : défi décliné
      initializedSocket.on("challengeDeclined", ({ message }) => {
        setDeclineMessage(message); // Stocker le message de refus
        setTimeout(() => setDeclineMessage(null), 5000); // Supprimer le message après 5 secondes
      });
    }

    // Nettoyage
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleAcceptChallenge = () => {
    if (socket && challengeData) {
      // Envoyer un message au serveur pour informer que le défi a été accepté
      socket.emit("acceptChallenge", {
        toUserId: challengeData.fromUser.id, // ID de l'utilisateur qui a envoyé le défi
        message: `Votre défi a été accepté par ${challengeData.fromUser.username}.`,
        challengeData
      });
    }
    setChallengeData(null); // Supprimer la notification après acceptation
  };

  const handleDeclineChallenge = () => {
    if (socket && challengeData) {
      // Envoyer un message au serveur pour informer que le défi a été décliné
      socket.emit("declineChallenge", {
        toUserId: challengeData.fromUser.id, // ID de l'utilisateur qui a envoyé le défi
        message: `Votre défi a été refusé par ${challengeData.fromUser.username}.`,
      });
    }
    setChallengeData(null); // Supprimer la notification après refus
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white relative">
        {/* Afficher la notification si un défi est reçu */}
        <ChallengeNotification
          challengeData={challengeData}
          onAccept={handleAcceptChallenge}
          onDecline={handleDeclineChallenge}
        />

        {/* Redirection vers la salle de défi */}
        {redirectToRoom && <Navigate to={redirectToRoom} replace />}

        {/* Afficher les détails du match si le défi est accepté */}
        {matchDetails && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md text-center">
              <h3 className="text-xl font-bold text-green-500 mb-4">Match démarré</h3>
              <p className="text-sm text-gray-300 mb-6">{matchDetails.message}</p>
              <p className="text-sm text-gray-400 mb-6">
                Salle : <span className="font-bold">{matchDetails.roomId}</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Joueurs : <span className="font-bold">{matchDetails.players.join(", ")}</span>
              </p>
              <button
                onClick={() => setMatchDetails(null)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Afficher le message de refus proprement */}
        {declineMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-lg p-4 w-full max-w-xs z-50">
            <p className="text-sm">{declineMessage}</p>
          </div>
        )}

        <Routes>
          {/* Route publique */}
          <Route path="/auth" element={<Auth />} />

          {/* Routes protégées */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="quiz/play"
              element={
                <ProtectedRoute>
                  <QuizPlay />
                </ProtectedRoute>
              }
            />
            <Route
              path="Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/:userId"
              element={
                <ProtectedRoute>
                  <PublicProfile />
                </ProtectedRoute>
              }
            />

            <Route path="leaderboard" element={<Leaderboard />} />
            <Route
              path="/players/online"
              element={
                <ProtectedRoute>
                  <AllOnlinePlayers />
                </ProtectedRoute>
              }
            />
            <Route
              path="leaderboard/full"
              element={
                <ProtectedRoute>
                  <FullLeaderboard />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="challenge"
              element={
                <ProtectedRoute>
                  <Challenge />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="challenge/room/:roomId"
              element={
                <ProtectedRoute>
                  <ChallengeRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="learning"
              element={
                <ProtectedRoute>
                  <Learning />
                </ProtectedRoute>
              }
            />
            <Route
              path="learning/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <LearningLesson />
                </ProtectedRoute>
              }
            />
            <Route path="news" element={<News />} />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="tournament"
              element={
                <ProtectedRoute>
                  <Tournament />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Erreur />} />
          </Route>

          {/* Routes admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="questions" element={<Questions />} />
            <Route path="users" element={<Users />} />
            <Route path="themes" element={<Themes />} />
            <Route path="settings" element={<Settings />} />
            <Route path="questions/theme/:name" element={<ThemeContent />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
