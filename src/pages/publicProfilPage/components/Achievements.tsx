import React from 'react';
import { UserProfile } from '../types';
import { Award, Trophy, Zap, BarChart2 } from 'lucide-react';

export const Achievements: React.FC<{ user: UserProfile }> = ({ user }) => (
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
      <Award className="w-6 h-6 text-yellow-400" />
      Succès
    </h2>
    <div className="space-y-3">
      {user.level >= 5 && (
        <AchievementItem 
          icon={<Trophy className="w-6 h-6" />}
          title={`Niveau ${user.level}`}
          description={`Atteint le niveau ${user.level}`}
          gradient="from-blue-600 to-cyan-600"
        />
      )}
      {user.bestStreak >= 3 && (
        <AchievementItem 
          icon={<Zap className="w-6 h-6" />}
          title="Série de victoires"
          description={`${user.bestStreak} victoires d'affilée`}
          gradient="from-purple-600 to-indigo-600"
        />
      )}
      {user.winRate >= 70 && (
        <AchievementItem 
          icon={<BarChart2 className="w-6 h-6" />}
          title="Expert"
          description={`${user.winRate}% de victoires`}
          gradient="from-green-600 to-emerald-600"
        />
      )}
    </div>
  </div>
);

const AchievementItem: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => (
  <div className={`flex items-center gap-3 p-3 bg-gradient-to-r ${gradient} rounded-lg`}>
    {icon}
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-sm opacity-90">{description}</div>
    </div>
  </div>
);