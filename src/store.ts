import { create } from 'zustand';

interface Lesson {
  id: string;
  title: string;
  progress: number;
  quizzesTaken: number;
  lastAttempt: string;
  pdfUrl?: string;
}

interface Store {
  lessons: Lesson[];
  updateProgress: (id: string, progress: number) => void;
  resetProgress: (id: string) => void;
  uploadPdf: (id: string, file: File) => Promise<void>;
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
  uploadPdf: async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lessonId', id.replace(/\D/g, ''));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      
      set((state) => ({
        lessons: state.lessons.map((lesson) =>
          lesson.id === id ? { ...lesson, pdfUrl: data.pdfUrl } : lesson
        ),
      }));
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  },
}));