import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export async function generateQuizQuestion(lessonTitle: string, difficulty: number): Promise<{
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Générez une question de quiz sur "${lessonTitle}" avec un niveau de difficulté de ${difficulty}/100.

Format requis (respectez EXACTEMENT ce format) :

QUESTION: [votre question]
A) [choix A]
B) [choix B]
C) [choix C]
D) [choix D]
CORRECT: [A, B, C, ou D]
EXPLANATION: [explication détaillée]

Règles importantes:
- La question doit être claire et précise
- Les choix doivent être distincts et plausibles
- Une seule réponse correcte
- L'explication doit être détaillée et éducative
- Répondez en français
- Respectez STRICTEMENT le format ci-dessus`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Improved parsing with better error handling
    const sections = response.split('\n');
    let question = '';
    const choices: Array<{id: string; text: string; isCorrect: boolean}> = [];
    let correctAnswer = '';
    let explanation = '';
    
    for (const line of sections) {
      if (line.startsWith('QUESTION:')) {
        question = line.replace('QUESTION:', '').trim();
      } else if (/^[A-D]\)/.test(line)) {
        const id = line[0];
        const text = line.slice(2).trim();
        choices.push({ id, text, isCorrect: false });
      } else if (line.startsWith('CORRECT:')) {
        correctAnswer = line.replace('CORRECT:', '').trim();
      } else if (line.startsWith('EXPLANATION:')) {
        explanation = line.replace('EXPLANATION:', '').trim();
      } else if (explanation && line.trim()) {
        // Append additional explanation lines
        explanation += ' ' + line.trim();
      }
    }

    // Validate parsed data
    if (!question || choices.length !== 4 || !correctAnswer || !explanation) {
      throw new Error('Invalid response format');
    }

    // Mark correct answer
    const correctChoice = choices.find(c => c.id === correctAnswer);
    if (!correctChoice) {
      throw new Error('Invalid correct answer');
    }
    correctChoice.isCorrect = true;

    return {
      question,
      choices,
      explanation
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    // Provide a fallback question if generation fails
    return {
      question: "Quelle est la première étape dans l'évaluation d'un patient?",
      choices: [
        { id: 'A', text: "L'anamnèse", isCorrect: true },
        { id: 'B', text: "L'examen physique", isCorrect: false },
        { id: 'C', text: "Les examens complémentaires", isCorrect: false },
        { id: 'D', text: "Le diagnostic différentiel", isCorrect: false }
      ],
      explanation: "L'anamnèse est toujours la première étape cruciale dans l'évaluation d'un patient. Elle permet de recueillir les informations essentielles sur les symptômes, l'histoire de la maladie et les antécédents du patient."
    };
  }
}