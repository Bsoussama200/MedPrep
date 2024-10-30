import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export async function getMedicalProfessorResponse(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Vous êtes un professeur de médecine compétent et bienveillant qui aide un étudiant à préparer ses examens médicaux. 
    Répondez à la question suivante de manière claire et pédagogique, en utilisant la terminologie médicale appropriée. 
    Répondez TOUJOURS en français : ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI response error:', error);
    return 'Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez réessayer votre question.';
  }
}