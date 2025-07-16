import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { Quiz } from "./pages/Quiz/Quiz";
import { QuizPlay } from "./pages/Quiz/QuizPlay";
import { Leaderboard } from "./pages/Leaderboard/Leaderboard";
import { Challenge } from "./pages/Challenge/Challenge";
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
import { useEffect } from "react";
import { initializeSocket, disconnectSocket } from "./socket";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const socket = initializeSocket(token);

      // Exemple d’écoute globale : défi reçu
      socket.on("receiveChallenge", (data) => {
        alert(
          `Défi reçu de ${data.fromUserId} : ${JSON.stringify(
            data.challengeData
          )}`
        );
        // Tu peux déclencher ici un toast, une animation, ou ouvrir un popup
      });
    }

    // Nettoyage
    return () => {
      disconnectSocket() 
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
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
            <Route
              path="challenge"
              element={
                <ProtectedRoute>
                  <Challenge />
                </ProtectedRoute>
              }
            />
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
