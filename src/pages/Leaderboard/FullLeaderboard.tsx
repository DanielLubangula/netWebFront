import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, User } from 'lucide-react';

const leaderboardData = {
  day: [
    { id: 1, name: 'Alex_Network', score: 2450, change: '+2' },
    { id: 2, name: 'Sophie_TCP', score: 2380, change: '+1' },
    { id: 3, name: 'Max_Router', score: 2320, change: '-1' },
    { id: 4, name: 'Emma_Switch', score: 2280, change: '+3' },
    { id: 5, name: 'Lucas_VPN', score: 2250, change: '+1' },
    // Ajoutez les autres joueurs ici...
  ],
  week: [
    { id: 1, name: 'Max_Router', score: 15420, change: '+1' },
    { id: 2, name: 'Alex_Network', score: 14950, change: '-1' },
    { id: 3, name: 'Sophie_TCP', score: 14380, change: '+2' },
    { id: 4, name: 'Lucas_VPN', score: 13820, change: '+1' },
    { id: 5, name: 'Emma_Switch', score: 13280, change: '-2' },
    // Ajoutez les autres joueurs ici...
  ],
  month: [
    { id: 1, name: 'Alex_Network', score: 68420, change: '=' },
    { id: 2, name: 'Max_Router', score: 65950, change: '=' },
    { id: 3, name: 'Sophie_TCP', score: 62380, change: '+1' },
    { id: 4, name: 'Lucas_VPN', score: 58820, change: '-1' },
    { id: 5, name: 'Emma_Switch', score: 55280, change: '=' },
    // Ajoutez les autres joueurs ici...
  ],
};

export const FullLeaderboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer la période depuis la navigation
  const period: 'day' | 'week' | 'month' = location.state?.period || 'day';

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Classement Complet ({period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : 'Mois'})
          </h1>
        </motion.div>

        <div className="space-y-3">
          {leaderboardData[period].map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-400">{player.score.toLocaleString()} pts</div>
              </div>
              
              <div className={`text-xs px-2 py-1 rounded ${
                player.change.startsWith('+') ? 'bg-green-600 text-white' :
                player.change.startsWith('-') ? 'bg-red-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {player.change}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-medium transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};