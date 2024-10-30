import { create } from 'zustand';
import { Lesson } from './types/upload';

interface Store {
  lessons: Lesson[];
  updateProgress: (id: string, progress: number) => void;
  resetProgress: (id: string) => void;
}

const initialLessons: Lesson[] = Array.from({ length: 75 }, (_, i) => ({
  id: `lesson-${i + 1}`,
  title: `Lesson ${i + 1}`,
  progress: Math.floor(Math.random() * 100),
  quizzesTaken: Math.floor(Math.random() * 5),
  lastAttempt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  pdfUrl: i === 0 ? 'https://www.medecinesfax.org/useruploads/files/1_AVC%20Re%C4%97sidanat%20version%202022%20(1).pdf' : undefined
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
}));