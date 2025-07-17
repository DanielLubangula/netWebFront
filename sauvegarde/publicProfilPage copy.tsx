import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Target, Medal, X, CheckCircle, BarChart2, Award, Clock, Users } from "lucide-react";
import { getSocket } from "../../socket"; 

interface Rank {
  daily: number;
  weekly: number;
  monthly: number;
}

interface Player {
  userId: string;
  username: string;
  profilePicture: string;
  score: number;
  correctAnswers: number;
  abandoned: boolean;
}

interface Match {
  _id: string;
  roomId: string;
  theme: string;
  status: string;
  startedAt: string;
  completedAt: string;
  winner: string;
  players: Player[];
  createdAt: string;
  updatedAt: string;
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
  bestStreak: number;
  totalScore: number;
  rank: Rank;
  matches?: Match[];
}

export const PublicProfile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [themes, setThemes] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [questionCount, setQuestionCount] = useState(3);

  const handleChallenge = (e: React.FormEvent) => {
    e.preventDefault();

    const socket = getSocket();
    if (!socket || !user) return;

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser) {
      alert("Erreur : Impossible de récupérer les informations de l'utilisateur.");
      return;
    }

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

    socket.emit("sendChallenge", {
      toUserId: user._id,
      challengeData,
    });

    setShowDrawer(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, matchesRes] = await Promise.all([
          axios.get(`https://netwebback.onrender.com/api/profil/public/${userId}`),
          axios.get(`https://netwebback.onrender.com/api/profil/matches/user/${userId}`)
        ]);

        const userData = userRes.data;
        const matchesData = matchesRes.data.map((match: Match) => {
          const opponent = match.players.find(p => p.userId !== userId);
          const player = match.players.find(p => p.userId === userId);
          
          return {
            ...match,
            result: match.winner === userId ? 'win' : 
                   match.winner ? 'loss' : 'draw',
            opponent: opponent?.username || 'Inconnu',
            playerScore: player?.score || 0,
            opponentScore: opponent?.score || 0,
            date: match.completedAt || match.startedAt
          };
        });

        setUser({
          ...userData,
          matches: matchesData.slice(0, 5) // Prendre les 5 derniers matchs
        });
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Chargement en cours...</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-red-500 text-xl">Utilisateur introuvable</div>
    </div>
  );

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
                  required
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
                  max={20}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(3, Math.min(20, Number(e.target.value))))}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium mt-4 transition-colors"
              >
                Envoyer le match
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section Profil */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user.profilePicture || '/default-profile.png'}
                alt={`${user.username}'s profile`}
                className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user.username}</h1>
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
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Statistiques */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-blue-400" />
                Statistiques
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Parties jouées</span>
                  </div>
                  <div className="text-2xl font-bold">{user.gamesPlayed}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Taux de victoire</span>
                  </div>
                  <div className="text-2xl font-bold">{user.winRate}%</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Série actuelle</span>
                  </div>
                  <div className="text-2xl font-bold">{user.currentStreak}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">Meilleure série</span>
                  </div>
                  <div className="text-2xl font-bold">{user.bestStreak}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Medal className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-400">Score total</span>
                  </div>
                  <div className="text-2xl font-bold">{user.totalScore}</div>
                </div>
              </div>
            </div>

            {/* Section Matchs récents */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-400" />
                Derniers matchs
              </h2>
              <div className="space-y-3">
                {user.matches && user.matches.length > 0 ? (
                  user.matches.map((match, index) => {
                    const player = match.players.find(p => p.userId === userId);
                    const opponent = match.players.find(p => p.userId !== userId);
                    
                    return (
                      <motion.div
                        key={match._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            match.winner === userId ? 'bg-green-400' :
                            match.winner ? 'bg-red-400' : 'bg-yellow-400'
                          }`} />
                          <div>
                            <div className="font-medium">vs {opponent?.username || 'Inconnu'}</div>
                            <div className="text-sm text-gray-400">{match.theme}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{player?.score || 0}-{opponent?.score || 0}</span>
                          <span className={`px-3 py-1 rounded text-sm font-medium ${
                            match.winner === userId ? 'bg-green-600 text-white' :
                            match.winner ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
                          }`}>
                            {match.winner === userId ? 'Victoire' :
                             match.winner ? 'Défaite' : 'Égalité'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Aucun match récent
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Section Classements */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Classements
              </h2>
              <div className="space-y-4">
                {[
                  { period: 'daily', icon: <Zap className="w-5 h-5 text-blue-400" />, label: "Aujourd'hui" },
                  { period: 'weekly', icon: <Target className="w-5 h-5 text-green-400" />, label: "Cette semaine" },
                  { period: 'monthly', icon: <Medal className="w-5 h-5 text-purple-400" />, label: "Ce mois" }
                ].map((item) => (
                  <div key={item.period} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-lg">
                        #{user.rank[item.period as keyof Rank]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Succès */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-400" />
                Succès
              </h2>
              <div className="space-y-3">
                {user.level >= 5 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                    <Trophy className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Niveau {user.level}</div>
                      <div className="text-sm opacity-90">Atteint le niveau {user.level}</div>
                    </div>
                  </div>
                )}
                {user.bestStreak >= 3 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                    <Zap className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Série de victoires</div>
                      <div className="text-sm opacity-90">{user.bestStreak} victoires d'affilée</div>
                    </div>
                  </div>
                )}
                {user.winRate >= 70 && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                    <BarChart2 className="w-6 h-6" />
                    <div>
                      <div className="font-medium">Expert</div>
                      <div className="text-sm opacity-90">{user.winRate}% de victoires</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};