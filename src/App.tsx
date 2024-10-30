import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonView from './pages/LessonView';
import { Brain, ArrowLeft, LogOut } from 'lucide-react';

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLessonView = location.pathname.includes('/lesson/');

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-[95vw] mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">MedPrep Pro</span>
          </div>
          <div className="flex items-center gap-3">
            {isLessonView && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
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
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <NavigationBar />
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lesson/:id" element={<LessonView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;