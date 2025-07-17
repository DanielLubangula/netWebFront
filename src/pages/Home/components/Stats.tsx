import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { getDashboardStats } from '../../../services/api';

export const Stats: React.FC = () => {
  const [stats, setStats] = React.useState({
    userCount: 0,
    matchCount: 0,
    // lessonCount: 0, // Pour usage futur
    // quizToday: 0, // Pour usage futur si dispo
    // challengeCount: 0, // Pour usage futur si dispo
  });
  React.useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
    });
  }, []);

  const statList = [
    { icon: Users, label: 'Joueurs inscrits', value: stats.userCount, color: 'text-blue-400' },
    { icon: Zap, label: "Quiz joués (total)", value: stats.matchCount, color: 'text-green-400' },
    // { icon: BookOpen, label: 'Leçons disponibles', value: stats.lessonCount, color: 'text-purple-400' }, // Pour usage futur
    // { icon: Trophy, label: 'Défis en cours', value: stats.challengeCount, color: 'text-yellow-400' }, // Pour usage futur
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statList.map((stat, index) => (
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