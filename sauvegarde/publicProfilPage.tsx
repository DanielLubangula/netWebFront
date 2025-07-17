import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Target, Medal, X, CheckCircle } from "lucide-react";
import { getSocket } from "../../socket"; 

interface Rank {
  daily: number;
  weekly: number;
  monthly: number;
}

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  totalScore: number;
  rank: Rank;
}

export const PublicProfile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // État pour afficher le message de succès

  const [themes, setThemes] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [questionCount, setQuestionCount] = useState(3);

  const handleChallenge = (e: React.FormEvent) => {
    e.preventDefault();

    const socket = getSocket();
    if (!socket || !user) return;

    // Récupérer les informations de l'utilisateur depuis le localStorage
    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser) {
      alert("Erreur : Impossible de récupérer les informations de l'utilisateur.");
      return;
    }

    // Enrichir les données du défi avec les informations de l'utilisateur
    const challengeData = {
      theme,
      questionCount,
      fromUser: {
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        id: currentUser._id,
        level: currentUser.level,
      },
    };

    console.log('challengeData', challengeData)
    socket.emit("sendChallenge", {
      toUserId: user._id,
      challengeData,
    });

    setShowDrawer(false);
    setShowSuccessMessage(true); // Afficher le message de succès
    setTimeout(() => setShowSuccessMessage(false), 2000); // Masquer le message après 5 secondes
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`https://netwebback.onrender.com/api/profil/public/${userId}`);
        console.log("--------------- : ",res.data)
        setUser(res.data);
      } catch (error) {
        console.error("Erreur de chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await axios.get("https://netwebback.onrender.com/api/questions/themes");
        setThemes(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des thèmes :", error);
      }
    };

    fetchThemes();
  }, []);

  if (loading) return <div className="text-white p-6">Chargement...</div>;
  if (!user) return <div className="text-red-500 p-6">Utilisateur introuvable.</div>;

  const experiencePercent = (user.experience / user.nextLevelExp) * 100;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Message de succès */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-lg p-4 w-full max-w-xs z-50"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-sm font-bold">Défi envoyé avec succès !</h3>
                <p className="text-xs text-gray-400">
                  Votre défi a été envoyé à <span className="font-bold">{user.username}</span>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer de défi */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-gray-800 border-l border-gray-700 z-50 shadow-lg flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Paramètres du match</h2>
              <button onClick={() => setShowDrawer(false)}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleChallenge} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1">Thème</label>
                <select
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="" disabled>
                    Sélectionnez un thème
                  </option>
                  {themes.map((themeName) => (
                    <option key={themeName} value={themeName}>
                      {themeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Nombre de questions</label>
                <input
                  type="number"
                  min={3}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(3, Number(e.target.value)))}
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium mt-4"
              >
                Envoyer le match
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infos utilisateur + bouton */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800 rounded-xl p-6 max-w-4xl mx-auto border border-gray-700 relative"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user.profilePicture}
            alt={`${user.username}'s profile`}
            className="w-24 h-24 rounded-full border-4 border-blue-500"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                Niveau {user.level}
              </span>
              <span className="text-gray-300">
                {user.experience} / {user.nextLevelExp} XP
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                style={{ width: `${experiencePercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {user.nextLevelExp - user.experience} XP pour le niveau suivant
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowDrawer(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Proposer un match
          </button>
        </div>

        {/* Classements */}
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Classements
          </h2>
          {(["daily", "weekly", "monthly"] as const).map((period) => (
            <div key={period} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {period === "daily" && <Zap className="w-5 h-5 text-blue-400" />}
                {period === "weekly" && <Target className="w-5 h-5 text-green-400" />}
                {period === "monthly" && <Medal className="w-5 h-5 text-purple-400" />}
                <span>
                  {period === "daily"
                    ? "Aujourd'hui"
                    : period === "weekly"
                    ? "Cette semaine"
                    : "Ce mois"}
                </span>
              </div>
              <span className="font-bold text-white">{user.rank[period]}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
