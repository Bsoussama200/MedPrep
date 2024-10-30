import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

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
  const isLastQuestion = currentQuestion === totalQuestions;

  const handleNext = () => {
    if (isLastQuestion) {
      onClose();
    } else {
      onNext();
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const isAnswerCorrect = selectedAnswer && 
    choices.find(c => c.id === selectedAnswer)?.isCorrect;

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
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Explication :</h3>
              <p className="text-gray-700">{explanation}</p>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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