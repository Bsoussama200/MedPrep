import { create } from 'zustand';
import { Lesson } from './types/upload';

interface Store {
  lessons: Lesson[];
  updateProgress: (id: string, progress: number) => void;
  resetProgress: (id: string) => void;
  uploadPdf: (id: string, pdfUrl: string) => Promise<void>;
}

const initialLessons: Lesson[] = Array.from({ length: 75 }, (_, i) => ({
  id: `lesson-${i + 1}`,
  title: `Lesson ${i + 1}`,
  progress: Math.floor(Math.random() * 100),
  quizzesTaken: Math.floor(Math.random() * 5),
  lastAttempt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString()
}));

export const useStore = create<Store>((set) => ({
  lessons: initialLessons,
  updateProgress: (id, progress) =>
    set((state) => ({
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, progress } : lesson
      ),
    })),
  resetProgress: (id) =>
    set((state) => ({
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, progress: 0, quizzesTaken: 0 } : lesson
      ),
    })),
  uploadPdf: async (id: string, pdfUrl: string) => {
    set((state) => ({
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, pdfUrl } : lesson
      ),
    }));
  },
}));