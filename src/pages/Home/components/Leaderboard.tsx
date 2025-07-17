import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, User, ChevronDown, ChevronUp, Minus, Flame, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../services/api';

interface Player {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
  totalScore: number;
  change?: string;
}

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'global' | 'daily' | 'weekly' | 'monthly'>('global');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetchApi('/api/profil/leaderboard');
        
        const data = await response.json();
        
        setPlayers(data[period].map((player: any, index: number) => ({
          ...player,
          change: calculateChange(index, data[period]),
        })));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  const calculateChange = (index: number, playersList: Player[]) => {
    // Implémentez votre logique pour calculer le changement de position
    // Par exemple en comparant avec les données précédentes
    return index % 3 === 0 ? "+1" : index % 3 === 1 ? "-1" : "=";
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 2: return <Medal className="w-4 h-4 text-gray-300" />;
      case 3: return <Award className="w-4 h-4 text-amber-500" />;
      default: return <span className="text-xs font-medium text-gray-400">{rank}</span>;
    }
  };

  const getChangeIcon = (change: string) => {
    if (change.startsWith('+')) return <ChevronUp className="w-3 h-3 text-green-500" />;
    if (change.startsWith('-')) return <ChevronDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getPeriodIcon = () => {
    switch (period) {
      case 'daily': return <Flame className="w-4 h-4" />;
      case 'weekly': return <Star className="w-4 h-4" />;
      case 'monthly': return <Calendar className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  function getCleanImageUrl(url?: string) {
    if (!url) return '/default-profile.png';

    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://netwebback.onrender.com${url}`;
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 mx-2">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPeriodIcon()}
            <h2 className="text-lg font-bold">Classement</h2>
          </div>
          
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="bg-gray-700 text-sm rounded px-2 py-1 border border-gray-600"
          >
            <option value="global">Global</option>
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-700 max-h-[calc(100vh-200px)] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun joueur dans le classement
          </div>
        ) : (
          players.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 ${index < 3 ? 'bg-gray-700/30' : ''}`}
              onClick={() => navigate(`/profile/${player._id}`)}
            >
              <div className="w-6 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>
              
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === 0 ? 'border-2 border-amber-400' : 'border border-gray-600'
                }`}
                style={{
                  backgroundImage: player.profilePicture 
                    ? `url(${getCleanImageUrl(player.profilePicture)})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: !player.profilePicture ? '#3B82F6' : 'transparent'
                }}
              >
                {!player.profilePicture && (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium truncate">
                    {player.username}
                  </span>
                  <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                    N.{player.level}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {player.totalScore.toLocaleString()} pts
                </div>
              </div>
              
              {/* Change Indicator */}
              {player.change && (
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  player.change.startsWith('+') ? 'bg-green-600/20 text-green-400' :
                  player.change.startsWith('-') ? 'bg-red-600/20 text-red-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {getChangeIcon(player.change)}
                  <span>{player.change.replace('+', '').replace('-', '')}</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 bg-gray-800 p-3 border-t border-gray-700">
        <button 
          onClick={() => navigate("/leaderboard/full", { state: { period } })}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition-colors"
        >
          Voir plus de détails
        </button>
      </div>
    </div>
  );
};