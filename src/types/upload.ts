export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
}) => void;

export interface UploadState {
  progress: number | null;
  error: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  progress: number;
  quizzesTaken: number;
  lastAttempt: string;
  pdfUrl?: string;
  content?: string;
  theme: string;
}

export interface Theme {
  name: string;
  lessons: Lesson[];
  averageProgress: number;
}

export interface StudyPlanInput {
  startDate: string;
  examDate: string;
  dailyHours: number;
  breakStartTime: string;
  breakEndTime: string;
  lessons: Array<{
    title: string;
    progress: number;
    theme: string;
  }>;
}

export interface StudyPlanSchedule {
  [day: string]: {
    lessons: string[];
  };
}

export interface StudyPlan {
  weeklySchedule: StudyPlanSchedule;
  recommendations: string[];
}