import React from 'react';
import { UserProfile } from '../types';
import { Users, Award, Zap, Trophy, Medal } from 'lucide-react';
import { BarChart2 } from 'lucide-react';

export const StatsSection: React.FC<{ user: UserProfile }> = ({ user }) => (
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
      <BarChart2 className="w-6 h-6 text-blue-400" />
      Statistiques
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard 
        icon={<Users className="w-5 h-5 text-blue-400" />}
        label="Parties jouées"
        value={user.gamesPlayed}
      />
      <StatCard 
        icon={<Award className="w-5 h-5 text-green-400" />}
        label="Taux de victoire"
        value={`${user.winRate}%`}
      />
      <StatCard 
        icon={<Zap className="w-5 h-5 text-purple-400" />}
        label="Série actuelle"
        value={user.currentStreak}
      />
      <StatCard 
        icon={<Trophy className="w-5 h-5 text-yellow-400" />}
        label="Meilleure série"
        value={user.bestStreak}
      />
      <StatCard 
        icon={<Medal className="w-5 h-5 text-orange-400" />}
        label="Score total"
        value={user.totalScore}
      />
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ 
  icon, label, value 
}) => (
  <div className="bg-gray-700 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);