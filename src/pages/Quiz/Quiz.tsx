import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Clock } from 'lucide-react';
import { fetchApi } from '../../services/api';

type Theme = {
  id: string; // exemple : 'modèle-osi'
  name: string; // exemple : 'Modèle OSI'
  color: string; // exemple : 'from-blue-600 to-cyan-600'
};

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetchApi('/api/questions/themes');
        const data = await res.json(); // data = tableau de noms de fichiers .md
        const availableColors = [
          'from-blue-600 to-cyan-600',
          'from-green-600 to-emerald-600',
          'from-purple-600 to-pink-600',
          'from-red-600 to-orange-600',
          'from-yellow-600 to-amber-600',
          'from-gray-600 to-slate-600',
        ];

        const themesFromFiles: Theme[] = data.map((filename: string, index: number) => {
          const baseName = filename.replace('.md', '');
          return {
            id: baseName,
            name: baseName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), // Mise en forme du nom
            color: availableColors[index % availableColors.length],
          };
        });

        setThemes(themesFromFiles);
      } catch (err) {
        console.error('Erreur lors du chargement des thèmes', err);
      }
    };

    fetchThemes();
  }, []);

  const handleThemeClick = (themeId: string) => {
    const time = questionCount * 15; // Calcul du temps total en secondes
    navigate('/quiz/play', {
      state: { theme: themeId, questionCount, time }, // Ajout de la propriété `time`
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
            Choisissez un thème pour commencer le quiz
          </p>
        </motion.div>

        {/* Configuration Quiz */}
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
                {[3, 5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Temps estimé</label>
              <div className="bg-gray-700 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-300">
                {Math.ceil(questionCount * 15)} secondes
              </div>
            </div>
          </div>
        </motion.div>

        {/* Affichage des thèmes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleThemeClick(theme.id)}
              className={`bg-gradient-to-br ${theme.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{theme.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const QuizPlay: React.FC = () => {
  const location = useLocation();
  const theme = location.state?.theme || 'general';
  const questionCount = location.state?.questionCount || 10;
  const timeLeft = location.state?.time || questionCount * 15; // Récupération du temps total

  console.log('Thème:', theme);
  console.log('Nombre de questions:', questionCount);
  console.log('Temps total (en secondes):', timeLeft);

  return (
    <div>
      <h1>Quiz Play</h1>
      <p>Thème : {theme}</p>
      <p>Nombre de questions : {questionCount}</p>
      <p>Temps total : {timeLeft} secondes</p>
    </div>
  );
};
