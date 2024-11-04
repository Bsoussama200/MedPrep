import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Send, MessageCircle, Loader2 } from 'lucide-react';
import { getMedicalProfessorResponse } from '../services/aiService';

interface QuizQuestionProps {
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  onNext: () => void;
  onClose: () => void;
}

interface Message {
  type: 'student' | 'ai';
  content: string;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  title,
  currentQuestion,
  totalQuestions,
  question,
  choices,
  explanation,
  onNext,
  onClose,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [furtherQuestion, setFurtherQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isLastQuestion = currentQuestion === totalQuestions;

  // Reset states when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setMessages([]);
    setFurtherQuestion('');
    setIsTransitioning(false);
  }, [question]);

  const handleNext = async () => {
    setIsTransitioning(true);
    
    if (isLastQuestion) {
      onClose();
    } else {
      // Wait for transition animation
      await new Promise(resolve => setTimeout(resolve, 300));
      onNext();
    }
  };

  const handleAskQuestion = async () => {
    if (!furtherQuestion.trim() || isLoading) return;

    const studentQuestion = furtherQuestion.trim();
    setMessages(prev => [...prev, { type: 'student', content: studentQuestion }]);
    setFurtherQuestion('');
    setIsLoading(true);

    try {
      const context = `
Question: ${question}
Explication donnée: ${explanation}
Question de l'étudiant: ${studentQuestion}`;

      const response = await getMedicalProfessorResponse(context, title);
      setMessages(prev => [...prev, { type: 'ai', content: response }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: "Désolé, je n'ai pas pu traiter votre question. Veuillez réessayer." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isAnswerCorrect = selectedAnswer && 
    choices.find(c => c.id === selectedAnswer)?.isCorrect;

  if (isTransitioning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[700px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">
              Question {currentQuestion} sur {totalQuestions}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-lg font-medium text-gray-900">{question}</div>

          <div className="space-y-3">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => !showExplanation && setSelectedAnswer(choice.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedAnswer === choice.id
                    ? showExplanation
                      ? choice.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                      : 'bg-indigo-50 border-indigo-200'
                    : showExplanation && choice.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                disabled={showExplanation}
              >
                <div className="flex items-center justify-between">
                  <span>{choice.text}</span>
                  {showExplanation && choice.isCorrect && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {showExplanation && !choice.isCorrect && selectedAnswer === choice.id && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedAnswer && !showExplanation && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowExplanation(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Voir l'explication
              </button>
            </div>
          )}

          {showExplanation && (
            <div className="mt-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Explication :</h3>
                <p className="text-gray-700">{explanation}</p>
              </div>

              {messages.length > 0 && (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        msg.type === 'student'
                          ? 'bg-indigo-50 ml-12'
                          : 'bg-gray-50 mr-12'
                      }`}
                    >
                      <div className="text-sm mb-1 text-gray-600">
                        {msg.type === 'student' ? 'Vous' : 'Assistant'}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center">
                  <MessageCircle className="h-5 w-5 text-gray-400 animate-pulse" />
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={furtherQuestion}
                      onChange={(e) => setFurtherQuestion(e.target.value)}
                      placeholder="Posez une question pour plus de détails..."
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={isLoading || !furtherQuestion.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
                >
                  {isLastQuestion ? 'Terminer' : 'Question suivante'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;