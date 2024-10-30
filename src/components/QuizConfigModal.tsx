import React, { useState } from 'react';
import { X } from 'lucide-react';

interface QuizConfigModalProps {
  title: string;
  onClose: () => void;
  onStart: (config: { questions: number; difficulty: number }) => void;
}

const QuizConfigModal: React.FC<QuizConfigModalProps> = ({ title, onClose, onStart }) => {
  const [questions, setQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState(50);

  const handleStart = () => {
    onStart({ questions, difficulty });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de questions: {questions}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={questions}
              onChange={(e) => setQuestions(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulté: {difficulty}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleStart}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Commencer le Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizConfigModal;