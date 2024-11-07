import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { generateQuizQuestion } from '../services/quizService';
import { useStore } from '../store';

interface MockExamProps {
  onClose: () => void;
}

interface ExamQuestion {
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
}

const TOTAL_QUESTIONS = 100;
const EXAM_DURATION = 7200; // 2 hours in seconds

const MockExam: React.FC<MockExamProps> = ({ onClose }) => {
  const { lessons } = useStore();
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION);
  const [answers, setAnswers] = useState<Array<{ question: number; correct: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    loadNextQuestion();
  }, []);

  useEffect(() => {
    if (examStarted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleEndExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const loadNextQuestion = async () => {
    setIsLoading(true);
    try {
      const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
      const question = await generateQuizQuestion(randomLesson.title, 70);
      setCurrentQuestion({
        question: question.question,
        choices: question.choices,
      });
      if (!examStarted) {
        setExamStarted(true);
      }
    } catch (error) {
      console.error('Failed to generate question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = currentQuestion.choices.find(c => c.id === selectedAnswer)?.isCorrect;
    setAnswers(prev => [...prev, { question: questionNumber, correct: !!isCorrect }]);

    if (questionNumber < TOTAL_QUESTIONS) {
      setQuestionNumber(prev => prev + 1);
      setSelectedAnswer(null);
      await loadNextQuestion();
    } else {
      handleEndExam();
    }
  };

  const handleEndExam = () => {
    setShowResults(true);
  };

  if (showResults) {
    const correctAnswers = answers.filter(a => a.correct).length;
    const percentage = Math.round((correctAnswers / answers.length) * 100);
    const getGrade = (percentage: number) => {
      if (percentage >= 90) return 'A';
      if (percentage >= 80) return 'B';
      if (percentage >= 70) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Résultats de l'Examen Blanc</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-white">{percentage}%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              Note: {getGrade(percentage)}
            </div>
            <p className="text-gray-600">
              {correctAnswers} réponses correctes sur {answers.length} questions
            </p>
            <p className="text-gray-500 mt-2">
              Temps utilisé: {formatTime(EXAM_DURATION - timeRemaining)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Examen Blanc</h2>
          <div className="flex items-center gap-4">
            {examStarted && (
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-600">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <button onClick={handleEndExam} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Question {questionNumber} sur {TOTAL_QUESTIONS}
          </div>
          <button
            onClick={handleEndExam}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Terminer l'examen
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">
              {!examStarted ? "Préparation de l'examen..." : "Chargement de la question..."}
            </p>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            <div className="text-lg font-medium text-gray-900">{currentQuestion.question}</div>

            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => setSelectedAnswer(choice.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedAnswer === choice.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {choice.text}
                </button>
              ))}
            </div>

            {selectedAnswer && (
              <div className="flex justify-end">
                <button
                  onClick={handleAnswer}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Question suivante
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-red-600 py-12">
            <AlertCircle className="h-5 w-5" />
            <span>Erreur lors du chargement de la question</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockExam;