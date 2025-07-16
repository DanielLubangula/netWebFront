import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, BookOpen, Trophy } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Joueurs actifs', value: '1,234', color: 'text-blue-400' },
  { icon: Zap, label: 'Quiz joués aujourd\'hui', value: '456', color: 'text-green-400' },
  { icon: BookOpen, label: 'Leçons disponibles', value: '28', color: 'text-purple-400' },
  { icon: Trophy, label: 'Défis en cours', value: '89', color: 'text-yellow-400' },
];

export const Stats: React.FC = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
          <p className="text-sm text-gray-400">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};