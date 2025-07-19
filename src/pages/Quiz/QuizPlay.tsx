// --- FRONTEND ---
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Trophy, Star } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Question {
  id: number;
  type: "QCM" | "VF" | "Libre";
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export const QuizPlay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = location.state?.theme || 'general';
  const questionCount = location.state?.questionCount || 5;
  const totalTime = location.state?.time || questionCount * 15; // temps personnalisé ou 15s/question par défaut

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textInput, setTextInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  interface RewardData {
    xp: number;
    points: number;
    newXP: number;
    newLevel: number;
  }
  const [rewardData, setRewardData] = useState<RewardData | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetchApi(`/api/questions/theme/${theme}/json/${questionCount}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement');
        setQuestions(data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [theme]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft((prev: number) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setAnswers([...answers, answerIndex]);
    setTextAnswers([...textAnswers, '']);
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const handleTextSubmit = () => {
    const currentOptions = questions[currentQuestion]?.options || [];
    const correctIndex = questions[currentQuestion]?.correct;
    if (!currentOptions[correctIndex]) return;
    const expected = normalize(currentOptions[correctIndex]);
    const user = normalize(textInput || '');
    const isCorrect = expected === user;

    setTextAnswers([...textAnswers, textInput]);
    setAnswers([...answers, isCorrect ? 1 : 0]);
    setSelectedAnswer(isCorrect ? 1 : 0);

    setTimeout(() => {
      nextQuestion();
      setTextInput('');
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    
    // Calculer le score
    const score = calculateScore();
    
    try {
      // Appeler la route de récompense
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token manquant");
        return;
      }

      const response = await fetchApi('/api/profil/solo-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: score,
          totalQuestions: questions.length
        })
      });

      if (response.ok) {
        const rewardData = await response.json();
        setRewardData(rewardData.reward);
        setShowReward(true);
      } else {
        console.error('Erreur lors de l\'attribution de la récompense');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel de la récompense:', error);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, q, i) => {
      if (q.type === 'Libre') {
        const expected = normalize(q.options[q.correct]);
        const user = normalize(textAnswers[i] || '');
        return score + (expected === user ? 1 : 0);
      } else {
        return score + ((answers[i] ?? -1) === q.correct ? 1 : 0);
      }
    }, 0);
  };

  const normalize = (str: string) => {
    return str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">Chargement des questions...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex justify-center items-center text-xl">Erreur : {error}</div>;

  if (quizCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 text-white">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Quiz Terminé !
            </h1>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <div className="flex items-center justify-center mb-4">
                {percentage >= 80 ? (
                  <Trophy className="w-12 h-12 text-yellow-400" />
                ) : percentage >= 60 ? (
                  <Star className="w-12 h-12 text-blue-400" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-green-400" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                Score : {score}/{questions.length}
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                {percentage}% de réussite
              </p>
              
              {showReward && rewardData && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4"
                >
                  <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Récompense Quiz Solo
                  </h3>
                  <p className="text-green-300">
                    +{rewardData.xp} XP et +{rewardData.points} points
                  </p>
                  {rewardData.newLevel > user?.level && (
                    <p className="text-yellow-400 font-semibold mt-2">
                      🎉 Niveau {rewardData.newLevel} atteint !
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Récapitulatif détaillé du quiz */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Récapitulatif du Quiz</h2>
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const userAnswer = q.type === 'Libre' ? textAnswers[idx] : (answers[idx] !== undefined ? q.options[answers[idx]] : '');
                  const correctAnswer = q.options[q.correct];
                  const isCorrect = q.type === 'Libre'
                    ? normalize(userAnswer) === normalize(correctAnswer)
                    : answers[idx] === q.correct;
                  return (
                    <div key={q.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold text-blue-300">Q{idx + 1}.</span>
                        <span className="font-semibold">{q.question}</span>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-2" />
                        )}
                      </div>
                      <div className="mb-1">
                        <span className="text-gray-400">Votre réponse : </span>
                        <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                          {userAnswer || <span className="italic text-gray-500">Aucune réponse</span>}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className="text-gray-400">Bonne réponse : </span>
                        <span className="text-blue-400">{correctAnswer}</span>
                      </div>
                      {q.explanation && (
                        <div className="text-xs text-gray-300 mt-1">
                          <span className="font-semibold text-yellow-300">Explication : </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={() => navigate('/quiz')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Nouveau Quiz
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  const renderOptions = () => {
    if (currentQ.type === 'Libre') {
      return (
        <div className="space-y-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Tapez votre réponse..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            disabled={selectedAnswer !== null}
          />
          <button
            onClick={handleTextSubmit}
            disabled={selectedAnswer !== null || !textInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Valider
          </button>
        </div>
      );
    }

    return currentQ.options.map((option, index) => (
      <button
          key={index}
          onClick={() => handleAnswerSelect(index)}
          disabled={selectedAnswer !== null}
        className={`w-full p-4 text-left rounded-lg border transition-all ${
          selectedAnswer === index
            ? index === currentQ.correct
              ? 'bg-green-600 border-green-500 text-white'
              : 'bg-red-600 border-red-500 text-white'
            : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50'
          }`}
        >
        <div className="flex items-center gap-3">
          {selectedAnswer === index ? (
            index === currentQ.correct ? (
              <CheckCircle className="w-5 h-5 text-green-300" />
            ) : (
              <XCircle className="w-5 h-5 text-red-300" />
            )
          ) : (
            <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
          )}
          {option}
          </div>
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Q{currentQuestion + 1}/{questions.length}</div>
            <div className="w-48 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Clock className="w-4 h-4 text-blue-400" /> {formatTime(timeLeft)}
          </div>
        </div>

        <motion.div
          key={currentQuestion}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">[{currentQ.type}] {currentQ.question}</h2>
          <div className="space-y-3">{renderOptions()}</div>
        </motion.div>
      </div>
    </div>
  );
};
