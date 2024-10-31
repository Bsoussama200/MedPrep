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