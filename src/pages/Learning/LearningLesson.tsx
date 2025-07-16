import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle, Play } from 'lucide-react';

const lessonContent = {
  '1': {
    title: 'Introduction aux réseaux',
    content: [
      {
        type: 'text',
        content: 'Un réseau informatique est un ensemble d\'ordinateurs et de périphériques connectés entre eux pour partager des ressources et des informations.'
      },
      {
        type: 'image',
        src: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
        alt: 'Réseau informatique'
      },
      {
        type: 'text',
        content: 'Les réseaux permettent de partager des fichiers, des imprimantes, une connexion Internet et bien plus encore.'
      },
      {
        type: 'quiz',
        question: 'Qu\'est-ce qu\'un réseau informatique ?',
        options: [
          'Un seul ordinateur',
          'Un ensemble d\'ordinateurs connectés',
          'Un logiciel',
          'Un périphérique'
        ],
        correct: 1
      }
    ]
  }
};

export const LearningLesson: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const lesson = lessonContent[lessonId as keyof typeof lessonContent];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Leçon non trouvée</h1>
          <button
            onClick={() => navigate('/learning')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retour à l'apprentissage
          </button>
        </div>
      </div>
    );
  }

  const currentContent = lesson.content[currentSection];
  const isLastSection = currentSection === lesson.content.length - 1;

  const handleNext = () => {
    if (currentContent.type === 'quiz' && quizAnswer === null) {
      return;
    }
    
    if (isLastSection) {
      navigate('/learning');
    } else {
      setCurrentSection(currentSection + 1);
      setQuizAnswer(null);
      setShowQuizResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setQuizAnswer(null);
      setShowQuizResult(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setQuizAnswer(answerIndex);
    setShowQuizResult(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/learning')}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">
                  Section {currentSection + 1} sur {lesson.content.length}
                </span>
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSection + 1) / lesson.content.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={currentSection}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8"
        >
          {currentContent.type === 'text' && (
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-gray-300">
                {currentContent.content}
              </p>
            </div>
          )}

          {currentContent.type === 'image' && (
            <div className="text-center">
              <img
                src={currentContent.src}
                alt={currentContent.alt}
                className="max-w-full h-64 object-cover rounded-lg mx-auto mb-4"
              />
              <p className="text-sm text-gray-400">{currentContent.alt}</p>
            </div>
          )}

          {currentContent.type === 'quiz' && (
            <div>
              <h3 className="text-xl font-bold mb-6">{currentContent.question}</h3>
              <div className="space-y-3 mb-6">
                {currentContent.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    disabled={showQuizResult}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                      showQuizResult
                        ? index === currentContent.correct
                          ? 'bg-green-600 border-green-500'
                          : index === quizAnswer && index !== currentContent.correct
                          ? 'bg-red-600 border-red-500'
                          : 'bg-gray-700 border-gray-600'
                        : quizAnswer === index
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    } border`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </div>
                  </button>
                ))}
              </div>

              {showQuizResult && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`p-4 rounded-lg ${
                    quizAnswer === currentContent.correct ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {quizAnswer === currentContent.correct ? 'Correct !' : 'Incorrect'}
                    </span>
                  </div>
                  {quizAnswer !== currentContent.correct && (
                    <p className="mt-2 text-sm">
                      La bonne réponse était : {currentContent.options[currentContent.correct]}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          <span className="text-gray-400">
            {currentSection + 1} / {lesson.content.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentContent.type === 'quiz' && quizAnswer === null}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isLastSection ? 'Terminer' : 'Suivant'}
            {isLastSection ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};