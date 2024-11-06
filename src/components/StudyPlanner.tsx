import React, { useState, useMemo } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2, X, AlertCircle } from 'lucide-react';
import { generateStudyPlan } from '../services/aiService';
import { useStore } from '../store';

interface StudyPlannerProps {
  onClose: () => void;
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

const StudyPlanner: React.FC<StudyPlannerProps> = ({ onClose }) => {
  const { lessons } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const defaultExamDate = '2024-12-12'; // Updated to 2024
  
  const [startDate, setStartDate] = useState(today);
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [dailyHours, setDailyHours] = useState(4);
  const [breakStartTime, setBreakStartTime] = useState("12:00");
  const [breakEndTime, setBreakEndTime] = useState("14:00");
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [error, setError] = useState<string | null>(null);

  const weekDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
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
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  const validateDates = () => {
    const start = new Date(startDate);
    const exam = new Date(examDate);
    
    if (start >= exam) {
      setError('La date de début doit être antérieure à la date d\'examen');
      return false;
    }

    const daysUntilExam = Math.ceil((exam.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExam < 7) {
      setError('Veuillez prévoir au moins une semaine de préparation');
      return false;
    }

    return true;
  };

  const validateTimes = () => {
    const startHour = parseInt(breakStartTime.split(':')[0]);
    const endHour = parseInt(breakEndTime.split(':')[0]);
    
    if (startHour >= endHour) {
      setError('L\'heure de début de pause doit être antérieure à l\'heure de fin');
      return false;
    }

    if (startHour < 8 || endHour > 22) {
      setError('Les heures doivent être comprises entre 8h et 22h');
      return false;
    }

    return true;
  };

  const handleGeneratePlan = async () => {
    if (!examDate || isLoading) return;

    setError(null);
    
    if (!validateDates() || !validateTimes()) return;

    setIsLoading(true);

    try {
      const generatedPlan = await generateStudyPlan({
        startDate,
        examDate,
        dailyHours,
        breakStartTime,
        breakEndTime,
        lessons: lessons.map(l => ({
          title: l.title,
          progress: l.progress,
          theme: l.theme
        }))
      });

      // Convert the generated plan into calendar events
      const newSchedule: WeeklySchedule = {};
      const startDateObj = new Date(startDate);
      const examDateObj = new Date(examDate);
      
      let currentDate = new Date(startDateObj);
      while (currentDate <= examDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        newSchedule[dateStr] = [];
        
        const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
        const daySchedule = generatedPlan.weeklySchedule[dayName];
        
        if (daySchedule) {
          let currentHour = 8;
          for (const lesson of daySchedule.lessons) {
            const matchingLesson = lessons.find(l => l.title === lesson);
            if (matchingLesson) {
              // Skip break time
              if (currentHour >= parseInt(breakStartTime) && currentHour < parseInt(breakEndTime)) {
                currentHour = parseInt(breakEndTime);
              }
              
              newSchedule[dateStr].push({
                title: matchingLesson.title,
                startTime: `${currentHour}:00`,
                endTime: `${currentHour + 2}:00`,
                progress: matchingLesson.progress,
                theme: matchingLesson.theme
              });
              currentHour += 2;

              // Stop if we've reached daily hours
              if (newSchedule[dateStr].length * 2 >= dailyHours) break;
            }
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Failed to generate study plan:', error);
      setError('Erreur lors de la génération du planning. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Début de la pause
                  </label>
                  <input
                    type="time"
                    value={breakStartTime}
                    onChange={(e) => setBreakStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fin de la pause
                  </label>
                  <input
                    type="time"
                    value={breakEndTime}
                    onChange={(e) => setBreakEndTime(e.target.value)}
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

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleGeneratePlan}
                disabled={!examDate || isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? (
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
                  <div className="h-16 border-b"></div>
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
                      <div className="h-16 border-b p-2 text-center flex flex-col justify-center">
                        <div className="font-medium text-gray-900 capitalize">
                          {weekDays[dayIndex]}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {date.getDate()} {date.toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                      <div className="relative">
                        {timeSlots.map((time) => (
                          <div key={time} className="h-20 border-b"></div>
                        ))}
                        {/* Break time indicator */}
                        <div
                          className="absolute left-0 right-0 bg-gray-100 border-y border-gray-200"
                          style={{
                            top: `${(parseInt(breakStartTime) - 8) * 80}px`,
                            height: `${(parseInt(breakEndTime) - parseInt(breakStartTime)) * 80}px`
                          }}
                        >
                          <div className="h-full flex items-center justify-center text-xs text-gray-500">
                            Pause déjeuner
                          </div>
                        </div>
                        {dayEvents.map((event, eventIndex) => {
                          const startHour = parseInt(event.startTime);
                          const endHour = parseInt(event.endTime);
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

export default StudyPlanner;