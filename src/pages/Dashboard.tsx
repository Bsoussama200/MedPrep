import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, CheckCircle, AlertCircle, MoreVertical, RefreshCw, BookOpen, LineChart } from 'lucide-react';
import { useStore } from '../store';

function StatsModal({ onClose }: { onClose: () => void }) {
  const { lessons } = useStore();
  const globalPercentage = Math.round(
    lessons.reduce((acc, lesson) => acc + lesson.progress, 0) / lessons.length
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[600px]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Mes Statistiques d'Apprentissage</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-indigo-600">{globalPercentage}%</div>
            <div className="text-sm text-gray-600">Progression Globale</div>
          </div>
          
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-end">
              {lessons.map((_, idx) => {
                const height = Math.min(85, Math.max(15, Math.random() * 100));
                return (
                  <div
                    key={idx}
                    style={{ height: `${height}%` }}
                    className="flex-1 bg-indigo-500 opacity-75 mx-0.5 rounded-t"
                  ></div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Début</span>
            <span>Temps</span>
            <span>Maintenant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardMenu({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const { resetProgress } = useStore();

  const handleReset = () => {
    resetProgress(lessonId);
    onClose();
  };

  const handleQuiz = () => {
    window.location.href = `/lesson/${lessonId}?quiz=true`;
    onClose();
  };

  return (
    <div className="absolute right-0 top-8 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu">
        <button
          onClick={handleReset}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <RefreshCw className="h-4 w-4 mr-3" />
          Réinitialiser la Progression
        </button>
        <button
          onClick={handleQuiz}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <BookOpen className="h-4 w-4 mr-3" />
          Commencer le Quiz
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { lessons } = useStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const handleCardClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleMenuClick = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === lessonId ? null : lessonId);
  };

  return (
    <div onClick={() => setActiveMenu(null)}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Votre Progression d'Études</h1>
          <p className="mt-2 text-gray-600">Suivez votre progression à travers 75 leçons médicales</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowStats(true)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LineChart className="h-4 w-4" />
            Mes Statistiques
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => handleCardClick(lesson.id)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden relative"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Book className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">
                    {lesson.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {lesson.progress >= 70 ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : lesson.progress > 0 ? (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  ) : null}
                  <button 
                    className="menu-button p-1 hover:bg-gray-100 rounded-full"
                    onClick={(e) => handleMenuClick(e, lesson.id)}
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {activeMenu === lesson.id && (
                <CardMenu 
                  lessonId={lesson.id} 
                  onClose={() => setActiveMenu(null)} 
                />
              )}

              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm font-medium text-gray-700">{lesson.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>{lesson.quizzesTaken} quiz complétés</span>
                <span className="mx-2">•</span>
                <span>{lesson.lastAttempt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}

export default Dashboard;