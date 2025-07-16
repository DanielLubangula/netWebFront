import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Swords, BookOpen, Trophy } from 'lucide-react';

const actions = [
  {
    icon: Brain,
    title: 'Quiz Solo',
    description: 'Testez vos connaissances',
    path: '/quiz',
    color: 'from-blue-600 to-cyan-600',
    hoverColor: 'hover:from-blue-700 hover:to-cyan-700',
  },
  {
    icon: Swords,
    title: 'Défier',
    description: 'Affrontez un joueur',
    path: '/players/online',
    color: 'from-purple-600 to-pink-600',
    hoverColor: 'hover:from-purple-700 hover:to-pink-700',
  },
  {
    icon: BookOpen,
    title: 'Apprendre',
    description: 'Cours et leçons',
    path: '/learning',
    color: 'from-green-600 to-emerald-600',
    hoverColor: 'hover:from-green-700 hover:to-emerald-700',
  },
  {
    icon: Trophy,
    title: 'Classement',
    description: 'Voir les meilleurs',
    path: '/leaderboard',
    color: 'from-yellow-600 to-orange-600',
    hoverColor: 'hover:from-yellow-700 hover:to-orange-700',
  },
];

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.path}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => navigate(action.path)}
          className={`bg-gradient-to-br ${action.color} ${action.hoverColor} 
            px-4 py-5 sm:px-5 sm:py-6 
            rounded-2xl transition-all duration-200 
            sm:hover:scale-105 shadow-lg group text-white text-center`}
        >
          <action.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
          <h3 className="text-base sm:text-lg font-bold mb-1">{action.title}</h3>
          <p className="text-xs sm:text-sm opacity-90">{action.description}</p>
        </motion.button>
      ))}
    </motion.div>
  );
};
