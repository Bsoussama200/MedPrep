import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export async function generateQuizQuestion(lessonTitle: string, difficulty: number): Promise<{
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  hint: string;
}> {
  if (!lessonTitle || typeof difficulty !== 'number') {
    throw new Error('Invalid parameters for quiz generation');
  }

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
EXPLANATION: [explication détaillée]

Règles importantes:
- La question doit être claire et précise
- Les choix doivent être distincts et plausibles
- Une seule réponse correcte
- L'explication doit être détaillée et éducative
- Répondez en français
- Respectez STRICTEMENT le format ci-dessus`;

    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    
    if (!response) {
      throw new Error('Empty response from AI');
    }

    // Parse response with better handling of multiline content
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
        // Append additional lines to the current section
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

    // Validate all required fields
    if (!question) throw new Error('Question is missing');
    if (choices.length !== 4) throw new Error('Invalid number of choices');
    if (!correctAnswer) throw new Error('Correct answer is missing');
    if (!explanation) throw new Error('Explanation is missing');

    // Validate correct answer format
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      throw new Error('Invalid correct answer format');
    }

    // Mark correct answer
    const correctChoice = choices.find(c => c.id === correctAnswer);
    if (!correctChoice) {
      throw new Error('Correct answer does not match any choice');
    }
    correctChoice.isCorrect = true;

    // Validate all choices have content
    if (choices.some(c => !c.text.trim())) {
      throw new Error('Empty choice detected');
    }

    return {
      question,
      choices,
      explanation,
      hint: '' // We don't need the hint text anymore since we're using visual hints
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // Provide a fallback question that's always valid
    return {
      question: "Quelle est la première étape dans l'évaluation d'un patient présentant des symptômes non spécifiques ?",
      choices: [
        { id: 'A', text: "L'anamnèse détaillée", isCorrect: true },
        { id: 'B', text: "L'examen physique complet", isCorrect: false },
        { id: 'C', text: "Les examens complémentaires ciblés", isCorrect: false },
        { id: 'D', text: "Le diagnostic différentiel immédiat", isCorrect: false }
      ],
      explanation: "L'anamnèse détaillée est toujours la première étape cruciale dans l'évaluation d'un patient. Elle permet de recueillir les informations essentielles sur les symptômes actuels, leur évolution, les antécédents médicaux et familiaux, ainsi que le contexte social et environnemental. Cette étape guide l'ensemble de la démarche diagnostique et permet d'orienter efficacement l'examen physique et les examens complémentaires éventuels.",
      hint: '' // We don't need the hint text anymore since we're using visual hints
    };
  }
}