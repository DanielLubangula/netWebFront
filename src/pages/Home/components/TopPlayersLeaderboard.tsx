import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Award, ChevronRight, Trophy, Medal, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../services/api';

interface Player {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
  totalScore: number;
}

export const TopPlayersLeaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState<{
    daily: Player[];
    weekly: Player[];
    monthly: Player[];
  }>({ daily: [], weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetchApi('/api/profil/leaderboard');
        const data = await response.json();
        
        setLeaderboardData({
          daily: data.daily.slice(0, 10),
          weekly: data.weekly.slice(0, 10),
          monthly: data.monthly.slice(0, 10)
        });
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  function getCleanImageUrl(url?: string) {
    if (!url) return '/default-profile.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-3 h-3 text-yellow-400" />;
      case 2: return <Medal className="w-3 h-3 text-gray-300" />;
      case 3: return <Award className="w-3 h-3 text-amber-500" />;
      default: return <span className="text-xs text-gray-400">{rank}</span>;
    }
  };

  const renderPeriodSection = (period: 'daily' | 'weekly' | 'monthly', players: Player[]) => {
    const periodConfig = {
      daily: { title: "Quotidien", icon: <Flame className="w-4 h-4 text-orange-400" /> },
      weekly: { title: "Hebdomadaire", icon: <Award className="w-4 h-4 text-blue-400" /> },
      monthly: { title: "Mensuel", icon: <Calendar className="w-4 h-4 text-green-400" /> }
    };

    return (
      <div className="flex-shrink-0 w-[280px] bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-3 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {periodConfig[period].icon}
              <h3 className="font-medium">{periodConfig[period].title}</h3>
            </div>
            <button 
              onClick={() => navigate(`/leaderboard/`)}
              // onClick={() => navigate(`/leaderboard/${period}`)}
              className="text-xs text-blue-400 flex items-center"
            >
              Voir tout <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-700 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Aucun joueur
            </div>
          ) : (
            players.map((player, index) => (
              <motion.div
                key={`${period}-${player._id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 hover:bg-gray-700/50 cursor-pointer"
                onClick={() => navigate(`/profile/${player._id}`)}
              >
                <div className="w-5 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'border-2 border-amber-400' : 'border border-gray-600'
                }`}
                style={{
                  backgroundImage: player.profilePicture 
                    ? `url(${getCleanImageUrl(player.profilePicture)})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: !player.profilePicture ? '#3B82F6' : 'transparent'
                }}>
                  {!player.profilePicture && (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm truncate">{player.username}</span>
                    <span className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded whitespace-nowrap">
                      N.{player.level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {player.totalScore} pts
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          Classements
        </h2>
      </div>

      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-4 w-max">
          {renderPeriodSection('daily', leaderboardData.daily)}
          {renderPeriodSection('weekly', leaderboardData.weekly)}
          {renderPeriodSection('monthly', leaderboardData.monthly)}
        </div>
      </div>
    </div>
  );
};

// Ajoutez ce CSS dans votre fichier global
// .hide-scrollbar {
//   -ms-overflow-style: none;
//   scrollbar-width: none;
// }
// .hide-scrollbar::-webkit-scrollbar {
//   display: none;
// }