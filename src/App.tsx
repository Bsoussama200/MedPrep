import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonView from './pages/LessonView';
import { Brain, ArrowLeft } from 'lucide-react';

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLessonView = location.pathname.includes('/lesson/');

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">MedPrep Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            {isLessonView && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Back to Dashboard</span>
              </button>
            )}
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign Out
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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