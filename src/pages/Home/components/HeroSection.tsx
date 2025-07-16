import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
      {/* Animated background - Optimisé pour mobile */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => ( // Réduit le nombre de particules sur mobile
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full opacity-20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0) 
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
            }}
            transition={{
              duration: Math.random() * 15 + 10, // Animation plus rapide
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          {/* Titre principal */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 px-2"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NetWebQuiz
            </span>
          </motion.h1>
          
          {/* Sous-titre */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12 max-w-2xl md:max-w-3xl mx-auto px-4"
          >
            Maîtrisez les réseaux informatiques à travers des quiz interactifs, 
            des défis passionnants et un apprentissage progressif
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
          >
            <button
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25 w-full sm:w-auto justify-center"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              Lancer un Quiz
            </button>
            
            <button
              onClick={() => navigate('/players/online')}
              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/25 w-full sm:w-auto justify-center"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              Défier un Joueur
            </button>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4"
          >
            <div className="text-center p-4 md:p-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 md:mb-2">Quiz Interactifs</h3>
              <p className="text-sm md:text-base text-gray-400">Testez vos connaissances avec nos quiz personnalisés</p>
            </div>
            
            <div className="text-center p-4 md:p-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 md:mb-2">Défis en Temps Réel</h3>
              <p className="text-sm md:text-base text-gray-400">Affrontez d'autres joueurs dans des duels épiques</p>
            </div>
            
            <div className="text-center p-4 md:p-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 md:mb-2">Classements</h3>
              <p className="text-sm md:text-base text-gray-400">Grimpez dans les classements et devenez le meilleur</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};