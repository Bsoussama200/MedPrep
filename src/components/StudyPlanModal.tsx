import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { generateStudyPlan } from '../services/aiService';

interface StudyPlanModalProps {
  onClose: () => void;
  lessons: Array<{ title: string; progress: number; theme: string }>;
}

interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
  progress: number;
  theme: string;
}

type WeeklySchedule = {
  [date: string]: CalendarEvent[];
};

const StudyPlanModal: React.FC<StudyPlanModalProps> = ({ onClose, lessons }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [schedule, setSchedule] = useState<WeeklySchedule>({});

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const currentWeekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short'
    });
  };

  const handleGeneratePlan = async () => {
    if (!examDate || isGenerating) return;

    setIsGenerating(true);
    try {
      const generatedPlan = await generateStudyPlan({
        startDate,
        examDate,
        dailyHours,
        lessons
      });

      // Convert the generated plan into calendar events
      const newSchedule: WeeklySchedule = {};
      const startDateObj = new Date(startDate);
      const examDateObj = new Date(examDate);
      
      let currentDate = new Date(startDateObj);
      while (currentDate <= examDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        newSchedule[dateStr] = [];
        
        const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'long' });
        const daySchedule = generatedPlan.weeklySchedule[dayName];
        
        if (daySchedule) {
          let currentHour = 8;
          for (const lesson of daySchedule.lessons) {
            const matchingLesson = lessons.find(l => l.title === lesson);
            if (matchingLesson) {
              newSchedule[dateStr].push({
                title: matchingLesson.title,
                startTime: `${currentHour}:00`,
                endTime: `${currentHour + 2}:00`,
                progress: matchingLesson.progress,
                theme: matchingLesson.theme
              });
              currentHour += 2;
            }
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Failed to generate study plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const getEventStyle = (progress: number) => {
    if (progress >= 80) return 'bg-green-100 border-green-500 text-green-700';
    if (progress >= 50) return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    return 'bg-red-100 border-red-500 text-red-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[95vw] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Planificateur d'études</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {Object.keys(schedule).length === 0 ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                  Heures d'étude par jour: {dailyHours}h
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

              <button
                onClick={handleGeneratePlan}
                disabled={!examDate || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer le planning'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {formatDate(currentWeekDates[0])} - {formatDate(currentWeekDates[6])}
                </h3>
              </div>
              <button
                onClick={() => setSchedule({})}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Modifier les paramètres
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-8 h-full">
                {/* Time slots column */}
                <div className="border-r">
                  <div className="h-12 border-b"></div>
                  {timeSlots.map((time) => (
                    <div key={time} className="h-20 border-b px-2 py-1 text-xs text-gray-500">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {currentWeekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvents = schedule[dateStr] || [];

                  return (
                    <div key={dayIndex} className="border-r">
                      <div className="h-12 border-b p-2 text-center">
                        <div className="font-medium text-gray-900">{weekDays[dayIndex]}</div>
                        <div className="text-sm text-gray-500">{formatDate(date)}</div>
                      </div>
                      <div className="relative">
                        {timeSlots.map((time) => (
                          <div key={time} className="h-20 border-b"></div>
                        ))}
                        {dayEvents.map((event, eventIndex) => {
                          const startHour = parseInt(event.startTime.split(':')[0]);
                          const endHour = parseInt(event.endTime.split(':')[0]);
                          const duration = endHour - startHour;
                          const top = (startHour - 8) * 80;
                          const height = duration * 80;

                          return (
                            <div
                              key={eventIndex}
                              className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 overflow-hidden ${getEventStyle(event.progress)}`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                            >
                              <div className="font-medium text-sm truncate">{event.title}</div>
                              <div className="text-xs opacity-75">
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="text-xs mt-1">
                                Progression: {event.progress}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanModal;