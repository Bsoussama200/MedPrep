import { GoogleGenerativeAI } from '@google/generative-ai';
import { useQuestionStore } from '../store/questionsStore';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export function getQuestionsForLesson(lessonId: string, count: number = 3): {
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
}[] {
  const { questions } = useQuestionStore.getState();
  const lessonQuestions = questions.filter(q => q.lessonId === lessonId);
  
  // Shuffle questions and take requested count
  return lessonQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(q => ({
      question: q.question,
      choices: q.choices,
      explanation: q.explanation
    }));
}

export async function generateQuizQuestion(lessonTitle: string, difficulty: number): Promise<{
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  hint: string;
}> {
  // First try to get a pre-stored question
  const lessonId = `lesson-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`;
  const storedQuestions = getQuestionsForLesson(lessonId, 1);
  
  if (storedQuestions.length > 0) {
    return {
      ...storedQuestions[0],
      hint: ''
    };
  }

  // Fallback to AI generation if no stored questions found
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `En tant que professeur de médecine, générez une question de quiz sur "${lessonTitle}" avec un niveau de difficulté de ${difficulty}/100.

Format requis (respectez EXACTEMENT ce format) :

QUESTION: [votre question]
A) [choix A]
B) [choix B]
C) [choix C]
D) [choix D]
CORRECT: [A, B, C, ou D]
EXPLANATION: [explication détaillée]`;

    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    
    if (!response) {
      throw new Error('Empty response from AI');
    }

    // Parse response
    const sections = response.split('\n');
    let question = '';
    const choices: Array<{id: string; text: string; isCorrect: boolean}> = [];
    let correctAnswer = '';
    let explanation = '';
    let currentSection = '';
    
    for (const line of sections) {
      if (line.startsWith('QUESTION:')) {
        currentSection = 'question';
        question = line.replace('QUESTION:', '').trim();
      } else if (/^[A-D]\)/.test(line)) {
        const id = line[0];
        const text = line.slice(2).trim();
        choices.push({ id, text, isCorrect: false });
      } else if (line.startsWith('CORRECT:')) {
        currentSection = 'correct';
        correctAnswer = line.replace('CORRECT:', '').trim();
      } else if (line.startsWith('EXPLANATION:')) {
        currentSection = 'explanation';
        explanation = line.replace('EXPLANATION:', '').trim();
      } else if (line.trim()) {
        switch (currentSection) {
          case 'question':
            question += ' ' + line.trim();
            break;
          case 'explanation':
            explanation += ' ' + line.trim();
            break;
        }
      }
    }

    // Mark correct answer
    const correctChoice = choices.find(c => c.id === correctAnswer);
    if (correctChoice) {
      correctChoice.isCorrect = true;
    }

    return {
      question,
      choices,
      explanation,
      hint: ''
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // Provide a fallback question
    return {
      question: "Quelle est la première étape dans l'évaluation d'un patient présentant des symptômes non spécifiques ?",
      choices: [
        { id: 'A', text: "L'anamnèse détaillée", isCorrect: true },
        { id: 'B', text: "L'examen physique complet", isCorrect: false },
        { id: 'C', text: "Les examens complémentaires ciblés", isCorrect: false },
        { id: 'D', text: "Le diagnostic différentiel immédiat", isCorrect: false }
      ],
      explanation: "L'anamnèse détaillée est toujours la première étape cruciale dans l'évaluation d'un patient. Elle permet de recueillir les informations essentielles sur les symptômes actuels, leur évolution, les antécédents médicaux et familiaux, ainsi que le contexte social et environnemental.",
      hint: ''
    };
  }
}