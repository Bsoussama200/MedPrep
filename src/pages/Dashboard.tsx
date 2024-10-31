import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, CheckCircle, AlertCircle, MoreVertical, RefreshCw, LineChart, LayoutGrid, LayoutList } from 'lucide-react';
import { useStore } from '../store';
import { evaluateProgress } from '../services/aiService';
import { Theme } from '../types/upload';

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
          <Book className="h-4 w-4 mr-3" />
          Commencer le Quiz
        </button>
      </div>
    </div>
  );
}

interface DashboardProps {
  selectedTheme: string | null;
  onThemeSelect: (theme: string | null) => void;
}

function Dashboard({ selectedTheme, onThemeSelect }: DashboardProps) {
  const navigate = useNavigate();
  const { lessons } = useStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState("");
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);
  const [viewMode, setViewMode] = useState<'lessons' | 'themes'>('lessons');

  const handleCardClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleMenuClick = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === lessonId ? null : lessonId);
  };

  const handleEvaluationClick = async () => {
    setShowEvaluation(true);
    setIsGeneratingEvaluation(true);
    try {
      const result = await evaluateProgress(lessons);
      setEvaluation(result);
    } catch (error) {
      console.error('Failed to generate evaluation:', error);
      setEvaluation("Une erreur est survenue lors de la génération de l'évaluation.");
    } finally {
      setIsGeneratingEvaluation(false);
    }
  };

  const themes: Theme[] = React.useMemo(() => {
    const themeMap = lessons.reduce((acc: { [key: string]: Theme }, lesson) => {
      if (!acc[lesson.theme]) {
        acc[lesson.theme] = {
          name: lesson.theme,
          lessons: [],
          averageProgress: 0
        };
      }
      acc[lesson.theme].lessons.push(lesson);
      return acc;
    }, {});

    return Object.values(themeMap).map(theme => ({
      ...theme,
      averageProgress: Math.round(
        theme.lessons.reduce((sum, lesson) => sum + lesson.progress, 0) / theme.lessons.length
      )
    }));
  }, [lessons]);

  const displayedLessons = selectedTheme
    ? lessons.filter(lesson => lesson.theme === selectedTheme)
    : lessons;

  return (
    <div onClick={() => setActiveMenu(null)} className="max-w-[95vw] mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          {selectedTheme ? (
            <h1 className="text-3xl font-bold text-gray-900">{selectedTheme}</h1>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Votre Progression d'Études</h1>
              <p className="mt-2 text-gray-600">Suivez votre progression à travers 75 leçons médicales</p>
            </>
          )}
        </div>
        <div className="flex gap-3">
          {!selectedTheme && (
            <button
              onClick={() => setViewMode(viewMode === 'lessons' ? 'themes' : 'lessons')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm"
            >
              {viewMode === 'lessons' ? (
                <>
                  <LayoutGrid className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600">Vue par thème</span>
                </>
              ) : (
                <>
                  <LayoutList className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600">Vue par leçon</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={handleEvaluationClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm"
          >
            <span className="text-indigo-600">Évaluation IA</span>
          </button>
          <button
            onClick={() => setShowStats(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm"
          >
            <LineChart className="h-4 w-4 text-indigo-600" />
            <span className="text-indigo-600">Mes Statistiques</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {viewMode === 'themes' && !selectedTheme ? (
          themes.map((theme) => (
            <div
              key={theme.name}
              onClick={() => onThemeSelect(theme.name)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{theme.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{theme.lessons.length} leçons</span>
                  <span>{theme.averageProgress}% complété</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${theme.averageProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          displayedLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleCardClick(lesson.id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden relative"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Book className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {lesson.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {lesson.progress >= 70 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : lesson.progress > 0 ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : null}
                    <button 
                      className="p-1 hover:bg-gray-100 rounded-full"
                      onClick={(e) => handleMenuClick(e, lesson.id)}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {activeMenu === lesson.id && (
                  <CardMenu 
                    lessonId={lesson.id} 
                    onClose={() => setActiveMenu(null)} 
                  />
                )}

                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Progression</span>
                    <span className="text-xs font-medium text-gray-700">{lesson.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>{lesson.quizzesTaken} quiz complétés</span>
                  <span className="mx-2">•</span>
                  <span>{lesson.lastAttempt}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      
      {showEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] relative">
            <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Évaluation IA</h2>
                <button 
                  onClick={() => {
                    setShowEvaluation(false);
                    setEvaluation("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              {isGeneratingEvaluation ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-pulse text-gray-400">Génération de l'évaluation en cours...</div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  {evaluation.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;