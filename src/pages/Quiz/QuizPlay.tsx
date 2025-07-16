// --- FRONTEND ---
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { fetchApi } from '../../services/api';

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const normalize = (str: string) =>
  str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();

export const QuizPlay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleQuizComplete = () => {
    setQuizCompleted(true);
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

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl">Chargement des questions...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex justify-center items-center text-xl">Erreur : {error}</div>;

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  if (quizCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-center">Quiz terminé 🎉</h1>
          <p className="mb-6 text-center">Score : <span className="text-green-400 font-semibold">{score}/{questions.length}</span> ({percentage}%)</p>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-gray-800 p-4 rounded">Réussites : <span className="text-green-400 font-bold">{score}</span></div>
            <div className="bg-gray-800 p-4 rounded">Total : <span className="text-blue-400 font-bold">{questions.length}</span></div>
            <div className="bg-gray-800 p-4 rounded">% : <span className="text-purple-400 font-bold">{percentage}%</span></div>
          </div>
          <h2 className="text-xl font-bold mb-4">Résumé des questions :</h2>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const isCorrect = q.type === 'Libre'
                ? normalize(q.options[q.correct]) === normalize(textAnswers[i] || '')
                : answers[i] === q.correct;
              const userAnswer = q.type === 'Libre' ? textAnswers[i] : q.options[answers[i]];
              return (
                <div key={q.id} className={`bg-gray-800 p-4 rounded border ${isCorrect ? 'border-green-600' : 'border-red-600'}`}>
                  <h3 className="font-medium mb-2">[{q.type}] {q.question}</h3>
                  <p className={`text-sm mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>Votre réponse : {userAnswer || 'Aucune'}</p>
                  {!isCorrect && (
                    <p className="text-sm text-gray-400">Bonne réponse : <span className="text-green-400">{q.options[q.correct]}</span></p>
                  )}
                  {q.explanation && <p className="text-xs text-gray-500 mt-2 italic">Explication : {q.explanation}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-8 gap-3">
            <button onClick={() => navigate('/quiz')} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white">Rejouer</button>
            <button onClick={() => navigate('/')} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white">Accueil</button>
          </div>
        </div>
      </div>
    );
  }

  const renderOptions = () => {
    if (currentQ.type === 'Libre') {
      return (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className={`w-full p-3 rounded-lg bg-gray-700 text-white border ${selectedAnswer !== null ? (selectedAnswer === 1 ? 'border-green-500' : 'border-red-500') : 'border-gray-600'}`}
            placeholder="Écrivez votre réponse ici"
            disabled={selectedAnswer !== null}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput || selectedAnswer !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg self-start"
          >
            Valider
          </button>
        </div>
      );
    }

    return currentQ.options.map((option, index) => {
      const isCorrect = selectedAnswer !== null && index === currentQ.correct;
      const isWrong = selectedAnswer === index && index !== currentQ.correct;
      return (
        <motion.button
          key={index}
          whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
          onClick={() => handleAnswerSelect(index)}
          disabled={selectedAnswer !== null}
          className={`w-full p-3 rounded-lg text-left border ${
            selectedAnswer !== null
              ? isCorrect
                ? 'bg-green-600 border-green-500'
                : isWrong
                ? 'bg-red-600 border-red-500'
                : 'bg-gray-700 border-gray-600'
              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm">{option}</span>
          </div>
        </motion.button>
      );
    });
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
