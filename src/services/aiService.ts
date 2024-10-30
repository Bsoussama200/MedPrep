import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export async function getMedicalProfessorResponse(message: string, lessonTitle?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Tu es un professeur de médecine expérimenté qui aide un étudiant à préparer ses examens médicaux.
    ${lessonTitle ? `Le sujet actuel est : "${lessonTitle}". ` : ''}
    
    Formatage de la réponse :
    - Utilise des paragraphes clairs et bien espacés
    - Évite les listes à puces ou numérotées
    - Utilise des phrases complètes
    - Sépare les concepts importants en paragraphes distincts
    - N'utilise pas de caractères spéciaux pour le formatage (*, -, #, etc.)
    
    Question : ${message}
    
    Réponds en français de manière structurée et professionnelle.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text()
      .replace(/\*\*/g, '')  // Remove bold markers
      .replace(/\*/g, '')    // Remove list markers
      .split('\n')           // Split into paragraphs
      .filter(p => p.trim()) // Remove empty paragraphs
      .join('\n\n');        // Join with double newlines for spacing
  } catch (error) {
    console.error('AI response error:', error);
    return 'Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez reformuler votre question.';
  }
}