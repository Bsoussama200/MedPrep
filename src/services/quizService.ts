import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export async function generateQuizQuestion(lessonTitle: string, difficulty: number): Promise<{
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `En tant que professeur de médecine, générez une question de quiz sur le sujet "${lessonTitle}" avec un niveau de difficulté de ${difficulty}%. 
    Format requis :
    - Une question
    - Quatre choix de réponse (A, B, C, D)
    - Une seule réponse correcte
    - Une explication détaillée de la réponse correcte
    
    Répondez en français et structurez la réponse exactement comme ceci :
    QUESTION: [votre question]
    A) [choix A]
    B) [choix B]
    C) [choix C]
    D) [choix D]
    CORRECT: [lettre de la réponse correcte]
    EXPLANATION: [explication détaillée]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse the response
    const questionMatch = response.match(/QUESTION: (.*?)(?=A\))/s);
    const choicesMatch = response.match(/([A-D]\) .*?)(?=[A-D]\)|CORRECT:)/gs);
    const correctMatch = response.match(/CORRECT: ([A-D])/);
    const explanationMatch = response.match(/EXPLANATION: (.*)/s);

    if (!questionMatch || !choicesMatch || !correctMatch || !explanationMatch) {
      throw new Error('Invalid response format');
    }

    const question = questionMatch[1].trim();
    const correctAnswer = correctMatch[1];
    const explanation = explanationMatch[1].trim();

    const choices = choicesMatch.map((choice, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      return {
        id: letter,
        text: choice.replace(/^[A-D]\) /, '').trim(),
        isCorrect: letter === correctAnswer
      };
    });

    return {
      question,
      choices,
      explanation
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz question');
  }
}