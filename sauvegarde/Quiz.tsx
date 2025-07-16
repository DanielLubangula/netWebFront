import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Clock } from 'lucide-react';

const quizThemes = [
  { id: 'osi', name: 'Modèle OSI', description: 'Les 7 couches du modèle OSI', difficulty: 'Débutant', color: 'from-blue-600 to-cyan-600' },
  { id: 'tcp-ip', name: 'TCP/IP', description: 'Protocoles TCP et IP', difficulty: 'Intermédiaire', color: 'from-green-600 to-emerald-600' },
  { id: 'routing', name: 'Routage', description: 'Protocoles de routage', difficulty: 'Avancé', color: 'from-purple-600 to-pink-600' },
  { id: 'security', name: 'Sécurité', description: 'Sécurité des réseaux', difficulty: 'Intermédiaire', color: 'from-red-600 to-orange-600' },
  { id: 'wireless', name: 'Réseaux sans fil', description: 'WiFi, Bluetooth, etc.', difficulty: 'Intermédiaire', color: 'from-yellow-600 to-amber-600' },
  { id: 'general', name: 'Général', description: 'Questions variées', difficulty: 'Mixte', color: 'from-gray-600 to-slate-600' },
];

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState<number>(10);

  const handleThemeClick = (themeId: string) => {
    navigate('/quiz/play', {
      state: { theme: themeId, questionCount },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Quiz Solo
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Choisissez votre thème et testez vos connaissances
          </p>
        </motion.div>

        {/* Quiz Configuration */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 mb-6 sm:mb-8"
        >
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Configuration du Quiz
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
                <option value={20}>20 questions</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Temps estimé</label>
              <div className="bg-gray-700 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-300">
                {Math.ceil(questionCount * 1.5)} minutes
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quiz Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {quizThemes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleThemeClick(theme.id)}
              className={`bg-gradient-to-br ${theme.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs bg-black bg-opacity-30 px-2 py-1 rounded-full">
                  {theme.difficulty}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{theme.name}</h3>
              <p className="text-xs sm:text-sm opacity-90">{theme.description}</p>
            </motion.div>
          ))}
        </div>

        
      </div>
    </div>
  );
};