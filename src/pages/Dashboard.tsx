import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  CheckCircle, 
  AlertCircle, 
  MoreVertical, 
  RefreshCw, 
  BookOpen, 
  LineChart, 
  Brain, 
  LayoutGrid, 
  LayoutList, 
  Heart, 
  Slice, 
  Bean, 
  Baby, 
  Ear, 
  Eye, 
  Brain as BrainIcon,
  Wind,
  PersonStanding
} from 'lucide-react';
import { useStore } from '../store';
import { evaluateProgress } from '../services/aiService';

// ... [Previous interfaces and StatsModal component remain exactly the same]

function EvaluationModal({ onClose, evaluation }: { onClose: () => void; evaluation: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Évaluation IA</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2">
          {evaluation.split('\n\n').map((paragraph, index) => (
            <p key={index} className={`text-gray-700 ${index > 0 ? 'mt-4' : ''}`}>
              {paragraph}
            </p>
          ))}
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

function Dashboard({ onThemeSelect, selectedTheme, viewMode, onViewModeChange }: DashboardProps) {
  const navigate = useNavigate();
  const { lessons } = useStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);

  const handleCardClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleMenuClick = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === lessonId ? null : lessonId);
  };

  const handleThemeClick = (theme: string) => {
    onThemeSelect(theme);
  };

  const getThemeProgress = (theme: string): number => {
    const themeLessons = lessons.filter(lesson => lesson.theme === theme);
    if (!themeLessons.length) return 0;
    return Math.round(
      themeLessons.reduce((acc, lesson) => acc + lesson.progress, 0) / themeLessons.length
    );
  };

  const handleGenerateEvaluation = async () => {
    setIsGeneratingEvaluation(true);
    setShowEvaluation(true);
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

  const themeIcons: { [key: string]: React.ReactNode } = {
    "Cardiologie": <Heart className="h-6 w-6 text-red-500" />,
    "Chirurgie générale": <Slice className="h-6 w-6 text-blue-500" />,
    "Gastrologie": <Bean className="h-6 w-6 text-green-500" />,
    "Gynécologie": <Baby className="h-6 w-6 text-pink-500" />,
    "Neurologie-Neurochirurgie": <BrainIcon className="h-6 w-6 text-purple-500" />,
    "ORL": <Ear className="h-6 w-6 text-amber-500" />,
    "Ophtalmologie": <Eye className="h-6 w-6 text-cyan-500" />,
    "Pneumo-allergologie": <Wind className="h-6 w-6 text-indigo-500" />,
    "Psychiatrie": <PersonStanding className="h-6 w-6 text-teal-500" />
  };

  const displayedLessons = selectedTheme
    ? lessons.filter(lesson => lesson.theme === selectedTheme)
    : lessons;

  return (
    <div onClick={() => setActiveMenu(null)} className="max-w-[95vw] mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTheme || 'Votre Progression d\'Études'}
          </h1>
          {!selectedTheme && (
            <p className="mt-2 text-gray-600">
              Suivez votre progression à travers 75 leçons médicales
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {!selectedTheme && (
            <button
              onClick={() => onViewModeChange(viewMode === 'themes' ? 'lessons' : 'themes')}
              className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {viewMode === 'themes' ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              Vue par {viewMode === 'themes' ? 'leçons' : 'thèmes'}
            </button>
          )}
          <button
            onClick={handleGenerateEvaluation}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Brain className="h-4 w-4" />
            Évaluation IA
          </button>
          <button
            onClick={() => setShowStats(true)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LineChart className="h-4 w-4" />
            Mes Statistiques
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {viewMode === 'themes' && !selectedTheme ? (
          Object.entries({
            "Cardiologie": lessons.filter(l => l.theme === "Cardiologie"),
            "Chirurgie générale": lessons.filter(l => l.theme === "Chirurgie générale"),
            "Gastrologie": lessons.filter(l => l.theme === "Gastrologie"),
            "Gynécologie": lessons.filter(l => l.theme === "Gynécologie"),
            "Neurologie-Neurochirurgie": lessons.filter(l => l.theme === "Neurologie-Neurochirurgie"),
            "ORL": lessons.filter(l => l.theme === "ORL"),
            "Ophtalmologie": lessons.filter(l => l.theme === "Ophtalmologie"),
            "Pneumo-allergologie": lessons.filter(l => l.theme === "Pneumo-allergologie"),
            "Psychiatrie": lessons.filter(l => l.theme === "Psychiatrie")
          }).map(([theme, themeLessons]) => (
            <div
              key={theme}
              onClick={() => handleThemeClick(theme)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  {themeIcons[theme]}
                  <h3 className="text-lg font-medium text-gray-900">{theme}</h3>
                </div>
                <span className="text-sm text-gray-500">{themeLessons.length} leçons</span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Progression</span>
                  <span className="text-xs font-medium text-gray-700">{getThemeProgress(theme)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${getThemeProgress(theme)}%` }}
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
        <EvaluationModal 
          onClose={() => setShowEvaluation(false)} 
          evaluation={isGeneratingEvaluation ? "Génération de l'évaluation en cours..." : evaluation} 
        />
      )}
    </div>
  );
}

export default Dashboard;