import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Lock, Play, Clock, Star } from 'lucide-react';

const lessons = [
  {
    id: 1,
    title: 'Introduction aux réseaux',
    description: 'Découvrez les bases des réseaux informatiques et leur importance',
    duration: '15 min',
    difficulty: 'Débutant',
    completed: true,
    locked: false,
    color: 'from-blue-600 to-cyan-600',
    rating: 4.8
  },
  {
    id: 2,
    title: 'Le modèle OSI',
    description: 'Comprenez les 7 couches du modèle OSI et leur rôle',
    duration: '20 min',
    difficulty: 'Débutant',
    completed: true,
    locked: false,
    color: 'from-green-600 to-emerald-600',
    rating: 4.9
  },
  {
    id: 3,
    title: 'Protocoles TCP/IP',
    description: 'Maîtrisez les protocoles fondamentaux d\'Internet',
    duration: '25 min',
    difficulty: 'Intermédiaire',
    completed: false,
    locked: false,
    color: 'from-purple-600 to-pink-600',
    rating: 4.7
  },
  {
    id: 4,
    title: 'Adressage IP',
    description: 'Apprenez les adresses IPv4 et IPv6',
    duration: '30 min',
    difficulty: 'Intermédiaire',
    completed: false,
    locked: false,
    color: 'from-yellow-600 to-orange-600',
    rating: 4.6
  },
  {
    id: 5,
    title: 'Sous-réseaux et VLSM',
    description: 'Maîtrisez la segmentation des réseaux',
    duration: '35 min',
    difficulty: 'Avancé',
    completed: false,
    locked: true,
    color: 'from-red-600 to-pink-600',
    rating: 4.8
  },
  {
    id: 6,
    title: 'Protocoles de routage',
    description: 'RIP, OSPF, BGP et leurs spécificités',
    duration: '40 min',
    difficulty: 'Avancé',
    completed: false,
    locked: true,
    color: 'from-indigo-600 to-purple-600',
    rating: 4.9
  }
];

export const Learning: React.FC = () => {
  const navigate = useNavigate();
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercent = (completedLessons / lessons.length) * 100;

  const handleLessonClick = (lessonId: number, locked: boolean) => {
    if (!locked) {
      navigate(`/learning/lesson/${lessonId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Apprentissage
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Progressez étape par étape dans l'univers des réseaux informatiques
          </p>
          
          {/* Progress */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-gray-400">{completedLessons}/{lessons.length} leçons</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{Math.round(progressPercent)}% terminé</p>
          </div>
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLessonClick(lesson.id, lesson.locked)}
              className={`relative bg-gray-800 rounded-2xl p-6 border border-gray-700 transition-all duration-200 ${
                lesson.locked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-gray-600 hover:scale-105 cursor-pointer'
              }`}
            >
              {lesson.locked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
              )}
              
              {lesson.completed && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              )}
              
              <div className={`w-12 h-12 bg-gradient-to-br ${lesson.color} rounded-xl flex items-center justify-center mb-4`}>
                <BookOpen className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
              <p className="text-gray-300 mb-4 text-sm">{lesson.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  lesson.difficulty === 'Débutant' ? 'bg-green-600 text-white' :
                  lesson.difficulty === 'Intermédiaire' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {lesson.difficulty}
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{lesson.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-400">{lesson.rating}</span>
                </div>
              </div>
              
              <button
                disabled={lesson.locked}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  lesson.locked
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : lesson.completed
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {lesson.locked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Verrouillé
                  </>
                ) : lesson.completed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Revoir
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Commencer
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Study Path */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 border border-gray-700"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Parcours d'apprentissage personnalisé</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Suivez un parcours structuré adapté à votre niveau. Chaque leçon débloque 
              la suivante et vous permet de progresser de manière cohérente.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-black bg-opacity-30 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Leçons interactives</span>
              </div>
              <div className="flex items-center gap-2 bg-black bg-opacity-30 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Quiz de validation</span>
              </div>
              <div className="flex items-center gap-2 bg-black bg-opacity-30 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Progression sauvegardée</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};