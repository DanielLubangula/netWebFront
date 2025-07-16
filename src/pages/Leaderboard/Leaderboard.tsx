import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { fetchApi } from '../../services/api';

interface Player {
  _id: string;
  username: string;
  level: number;
  experience: number;
  totalScore: number;
  profilePicture: string;
}

interface LeaderboardData {
  global: Player[];
  daily: Player[];
  weekly: Player[];
  monthly: Player[];
}

export const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function getCleanImageUrl(url?: string) {
    if (!url) return '/default-profile.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchApi('/api/profil/leaderboard');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-base sm:text-lg font-bold text-gray-400">
            {rank}
          </span>
        );
    }
  };

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case "daily":
        return "Aujourd'hui";
      case "weekly":
        return "Semaine";
      case "monthly":
        return "Mois";
      default:
        return "";
    }
  };

  const getAvatarFromUsername = (username: string) => {
    // Simple fonction pour générer un emoji basé sur le username
    const emojis = ["👨‍💻", "👩‍💻", "👨‍🔧", "👩‍🎓", "👨‍🚀", "👩‍🔬", "👨‍💼", "👩‍🚀"];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Aucune donnée disponible</div>
      </div>
    );
  }

  const currentData = data[period];

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Classement
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Les meilleurs joueurs de NetWebQuiz
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <div className="flex bg-gray-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-700 overflow-x-auto">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-2 sm:px-6 sm:py-3 rounded-md sm:rounded-lg text-sm sm:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  period === p
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {getPeriodLabel(p)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              Classement complet
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {currentData.map((player, index) => (
              <motion.div
                key={player._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-700 transition-colors ${
                  index < 3
                    ? "bg-gradient-to-r from-gray-700/50 to-transparent"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center w-6 sm:w-8">
                  {getRankIcon(index + 1)}
                </div>

                <div className="flex items-center">
                  {player.profilePicture ? (
                    <img 
                      src={getCleanImageUrl(player.profilePicture)} 
                      alt={player.username}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-xl sm:text-2xl">
                      {getAvatarFromUsername(player.username)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-bold text-base sm:text-lg truncate">{player.username}</span>
                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                      N.{player.level}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 truncate">
                    {player.totalScore.toLocaleString()} pts
                  </div>
                </div>

                <div className="text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gray-600 text-white">
                  {player.experience} XP
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  );
};