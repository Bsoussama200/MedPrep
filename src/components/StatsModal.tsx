import React from 'react';
import { X, TrendingUp, Award, Clock } from 'lucide-react';
import { useStore } from '../store';

interface StatsModalProps {
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ onClose }) => {
  const { lessons } = useStore();

  // Calculate overall statistics
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(lesson => lesson.progress === 100).length;
  const averageProgress = Math.round(
    lessons.reduce((acc, lesson) => acc + lesson.progress, 0) / totalLessons
  );
  const totalQuizzes = lessons.reduce((acc, lesson) => acc + lesson.quizzesTaken, 0);

  // Calculate theme statistics
  const themeStats = lessons.reduce((acc: { [key: string]: { count: number; progress: number } }, lesson) => {
    if (!acc[lesson.theme]) {
      acc[lesson.theme] = { count: 0, progress: 0 };
    }
    acc[lesson.theme].count++;
    acc[lesson.theme].progress += lesson.progress;
    return acc;
  }, {});

  // Calculate average progress per theme
  Object.keys(themeStats).forEach(theme => {
    themeStats[theme].progress = Math.round(themeStats[theme].progress / themeStats[theme].count);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Statistiques Globales</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Progression Moyenne</h3>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{averageProgress}%</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Leçons Complétées</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {completedLessons}/{totalLessons}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Quiz Complétés</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalQuizzes}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression par Thème</h3>
        <div className="space-y-4">
          {Object.entries(themeStats).map(([theme, stats]) => (
            <div key={theme} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{theme}</h4>
                <span className="text-sm text-gray-600">{stats.count} leçons</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-600">Progression moyenne</span>
                <span className="text-sm font-medium text-gray-900">{stats.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;