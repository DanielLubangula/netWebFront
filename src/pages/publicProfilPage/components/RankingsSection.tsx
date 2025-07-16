import React from 'react';
import { Rank } from '../types';
import { Trophy, Zap, Target, Medal } from 'lucide-react';

export const RankingsSection: React.FC<{ rank: Rank }> = ({ rank }) => (
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
      <Trophy className="w-6 h-6 text-yellow-400" />
      Classements
    </h2>
    <div className="space-y-4">
      <RankingItem 
        period="daily" 
        icon={<Zap className="w-5 h-5 text-blue-400" />} 
        label="Aujourd'hui"
        value={rank.daily}
      />
      <RankingItem 
        period="weekly" 
        icon={<Target className="w-5 h-5 text-green-400" />} 
        label="Cette semaine"
        value={rank.weekly}
      />
      <RankingItem 
        period="monthly" 
        icon={<Medal className="w-5 h-5 text-purple-400" />} 
        label="Ce mois"
        value={rank.monthly}
      />
    </div>
  </div>
);

const RankingItem: React.FC<{ 
  period: string; 
  icon: React.ReactNode; 
  label: string; 
  value: number 
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <Trophy className="w-5 h-5 text-yellow-400" />
      <span className="font-bold text-lg">#{value}</span>
    </div>
  </div>
);