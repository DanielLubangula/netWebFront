import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Award, Check, X } from 'lucide-react';

// Définir le type pour les questions
interface Question {
  id: string; // Identifiant unique de la question
  question: string; // Texte de la question
  options: string[]; // Liste des réponses possibles
  correct: number; // Index de la bonne réponse dans `options`
}

export const QuizPlay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = location.state?.theme || 'general';

  const [questions, setQuestions] = useState<Question[]>([]); // Utilisation du type `Question[]`
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://netwebback.onrender.com/api/questions/theme/${theme}/json`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement');

        setQuestions(data.questions); // Type `Question[]` attendu ici
        console.log(data.questions)
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur inconnue est survenue.');
        }
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [theme]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        handleQuizComplete();
      }
    }, 1500);
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index]?.correct ? 1 : 0);
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">
        Chargement des questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-500 flex justify-center items-center text-xl">
        Erreur : {error}
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  if (quizCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700 mb-6 sm:mb-8 text-center"
          >
            <Award className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quiz Terminé !</h1>
            <p className="text-gray-300 mb-6">Votre score final</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">{score}</div>
                <div className="text-xs sm:text-sm text-gray-400">Bonnes réponses</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-xl sm:text-2xl font-bold text-green-400">{percentage}%</div>
                <div className="text-xs sm:text-sm text-gray-400">Score</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">{questions.length}</div>
                <div className="text-xs sm:text-sm text-gray-400">Questions</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => navigate('/quiz')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                Nouveau Quiz
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                Accueil
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Résumé des questions</span>
            </h2>

            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correct;
                const correctAnswer = question.options[question.correct];

                return (
                  <div key={question.id} className="border-b border-gray-700 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3 mb-4">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="font-medium text-lg sm:text-xl mb-2">{question.question}</h3>
                        <div className="text-sm text-gray-400 mb-1">
                          Votre réponse: <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {question.options[userAnswer] || 'Aucune'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-gray-400 mb-2">
                            Bonne réponse: <span className="font-medium text-green-400">{correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-sm sm:text-lg font-medium whitespace-nowrap">
              Q{currentQuestion + 1}/{questions.length}
            </div>
            <div className="flex-1 sm:w-64 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg font-medium">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <motion.div
          key={currentQuestion}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{currentQ.question}</h2>

          <div className="space-y-3 sm:space-y-4">
            {currentQ.options.map((option: string, index: number) => {
              const isCorrect = selectedAnswer !== null && index === currentQ.correct;
              const isWrong = selectedAnswer === index && index !== currentQ.correct;

              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-3 sm:p-4 rounded-lg text-left transition-all duration-200 ${
                    selectedAnswer !== null
                      ? isCorrect
                        ? 'bg-green-600 border-green-500'
                        : isWrong
                        ? 'bg-red-600 border-red-500'
                        : 'bg-gray-700 border-gray-600'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  } border`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
