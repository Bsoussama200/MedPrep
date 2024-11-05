import React, { useState } from 'react';
import { X, Calendar, Brain, Clock, Target, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { generateStudyPlan } from '../services/aiService';

interface StudyPlannerModalProps {
  onClose: () => void;
}

interface StudyPlan {
  dailyHours: number;
  weeklySchedule: {
    [key: string]: {
      lessons: string[];
      hours: number;
    };
  };
  milestones: {
    date: string;
    goal: string;
    lessons: string[];
  }[];
  recommendations: string[];
}

const StudyPlannerModal: React.FC<StudyPlannerModalProps> = ({ onClose }) => {
  const { lessons } = useStore();
  const [startDate, setStartDate] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!startDate || !examDate) {
      setError('Please select both start and exam dates');
      return;
    }

    const start = new Date(startDate);
    const exam = new Date(examDate);

    if (start >= exam) {
      setError('Start date must be before exam date');
      return;
    }

    const daysUntilExam = Math.ceil((exam.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExam < 7) {
      setError('Please allow at least a week for study preparation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const plan = await generateStudyPlan({
        startDate,
        examDate,
        dailyHours,
        lessons: lessons.map(l => ({
          title: l.title,
          progress: l.progress,
          theme: l.theme
        }))
      });
      setStudyPlan(plan);
    } catch (error) {
      setError('Failed to generate study plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Planificateur d'Études</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!studyPlan ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'examen
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heures d'étude quotidiennes: {dailyHours}h
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-5 w-5 animate-pulse" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Générer le Plan
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Période d'étude</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Du {formatDate(startDate)} au {formatDate(examDate)}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Temps quotidien</h3>
                </div>
                <p className="text-sm text-gray-600">{dailyHours} heures par jour</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Objectif</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {studyPlan.milestones.length} jalons à atteindre
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Planning Hebdomadaire</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(studyPlan.weeklySchedule).map(([day, schedule]) => (
                  <div key={day} className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{day}</h4>
                    <div className="space-y-2">
                      {schedule.lessons.map((lesson, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          • {lesson}
                        </div>
                      ))}
                      <div className="text-sm font-medium text-indigo-600 mt-2">
                        {schedule.hours} heures
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Jalons</h3>
              <div className="space-y-4">
                {studyPlan.milestones.map((milestone, idx) => (
                  <div key={idx} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{milestone.goal}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(milestone.date)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {milestone.lessons.map((lesson, lessonIdx) => (
                        <div key={lessonIdx} className="text-sm text-gray-600">
                          • {lesson}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommandations Personnalisées
              </h3>
              <div className="space-y-2">
                {studyPlan.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-gray-700">• {rec}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStudyPlan(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Modifier
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlannerModal;