import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonView from './pages/LessonView';
import { Stethoscope, ArrowLeft, LogOut } from 'lucide-react';

interface NavigationBarProps {
  selectedTheme?: string | null;
  onBackToThemes?: () => void;
  viewMode: 'lessons' | 'themes';
}

function NavigationBar({ selectedTheme, onBackToThemes, viewMode }: NavigationBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLessonView = location.pathname.includes('/lesson/');

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-[95vw] mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold">
              Med
              <span className="text-blue-500">S</span>
              <span className="text-red-500">k</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">o</span>
              <span className="text-green-500">l</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isLessonView ? (
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </button>
            ) : selectedTheme && onBackToThemes && (
              <button
                onClick={onBackToThemes}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour aux thèmes
              </button>
            )}
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'lessons' | 'themes'>('themes');

  const handleBackToThemes = () => {
    setSelectedTheme(null);
    setViewMode('themes');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <NavigationBar 
          selectedTheme={selectedTheme} 
          onBackToThemes={handleBackToThemes}
          viewMode={viewMode}
        />
        <main className="py-4">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                onThemeSelect={setSelectedTheme} 
                selectedTheme={selectedTheme}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            } />
            <Route path="/lesson/:id" element={<LessonView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;