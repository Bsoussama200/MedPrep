import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lesson, StudyPlanInput, StudyPlan } from '../types/upload';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlan> {
  try {
    const model = genAI.getGenerativeModel({ model: 'Gemini-1.5-pro' });
    
    const daysUntilExam = Math.ceil(
      (new Date(input.examDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `En tant que planificateur d'études médicales expérimenté, crée un planning d'études optimisé avec ces paramètres:

Période d'études: ${daysUntilExam} jours
Heures d'étude quotidiennes: ${input.dailyHours}h
Pause déjeuner: ${input.breakStartTime} - ${input.breakEndTime}

Leçons à étudier:
${input.lessons.map(l => `- ${l.title} (Progression actuelle: ${l.progress}%, Thème: ${l.theme})`).join('\n')}

Instructions:
1. Priorise les leçons avec une faible progression
2. Répartis les leçons du même thème sur différents jours
3. Alterne entre les thèmes pour maintenir l'engagement
4. Prévois des sessions de révision pour les leçons avancées
5. Limite chaque session à 2 heures maximum
6. Respecte la pause déjeuner
7. Ne dépasse pas les heures quotidiennes spécifiées

Format de réponse requis (JSON):
{
  "weeklySchedule": {
    "lundi": { "lessons": ["Titre Leçon 1", "Titre Leçon 2"] },
    "mardi": { "lessons": ["Titre Leçon 3", "Titre Leçon 4"] },
    ...
  },
  "recommendations": ["recommandation 1", "recommandation 2", ...]
}`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const plan = JSON.parse(jsonMatch[0]);

    // Validate the plan structure
    if (!plan.weeklySchedule || !plan.recommendations || !Array.isArray(plan.recommendations)) {
      throw new Error('Invalid plan structure');
    }

    // Validate each day's schedule
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    days.forEach(day => {
      if (!plan.weeklySchedule[day] || !Array.isArray(plan.weeklySchedule[day].lessons)) {
        plan.weeklySchedule[day] = { lessons: [] };
      }
    });

    // Ensure the number of lessons per day respects daily hours
    Object.keys(plan.weeklySchedule).forEach(day => {
      const maxLessons = Math.floor(input.dailyHours / 2); // 2 hours per lesson
      if (plan.weeklySchedule[day].lessons.length > maxLessons) {
        plan.weeklySchedule[day].lessons = plan.weeklySchedule[day].lessons.slice(0, maxLessons);
      }
    });

    return plan;
  } catch (error) {
    console.error('Study plan generation error:', error);
    throw new Error('Failed to generate study plan');
  }
}

export async function getMedicalProfessorResponse(message: string, lessonTitle?: string): Promise<string> {
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'Gemini-1.5-pro' });
    
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
    if (!result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    return response
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .filter(p => p.trim())
      .join('\n\n');
  } catch (error) {
    console.error('AI response error:', error);
    throw new Error('Failed to get professor response');
  }
}

export async function evaluateProgress(lessons: Lesson[]): Promise<string> {
  if (!lessons || lessons.length === 0) {
    throw new Error('No lessons provided for evaluation');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'Gemini-1.5-pro' });
    
    const lessonsData = lessons.map(lesson => ({
      title: lesson.title,
      progress: lesson.progress,
      quizzesTaken: lesson.quizzesTaken
    }));

    const prompt = `En tant que professeur de médecine, analyse la progression de l'étudiant dans ses leçons et fournis une évaluation constructive.

Données de progression :
${JSON.stringify(lessonsData, null, 2)}

Instructions :
- Concentre-toi sur les leçons avec une progression élevée et celles qui nécessitent plus de travail
- Identifie les domaines qui méritent une attention particulière
- Suggère des stratégies d'amélioration concrètes
- Évite les formules d'introduction générales
- Commence directement par l'analyse des progrès
- Utilise un ton professionnel mais encourageant
- Format en paragraphes clairs, pas de listes à puces

Réponds en français.`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }
    
    return response
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .filter(line => line.trim())
      .join('\n\n');
  } catch (error) {
    console.error('Progress evaluation error:', error);
    throw new Error('Failed to evaluate progress');
  }
}

export async function evaluateDiagnosis(
  diagnosis: string,
  lessonTitle: string,
  initialCase: string
): Promise<{ isCorrect: boolean; explanation: string }> {
  if (!diagnosis.trim() || !lessonTitle.trim() || !initialCase.trim()) {
    throw new Error('Missing required parameters');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'Gemini-1.5-pro' });
    
    const prompt = `En tant que professeur de médecine expérimenté, évalue le diagnostic proposé par l'étudiant.

Cas clinique initial :
${initialCase}

Diagnostic proposé :
${diagnosis}

Contexte : Leçon sur "${lessonTitle}"

Format de réponse requis (JSON):
{
  "isCorrect": true/false,
  "explanation": "Explication détaillée..."
}`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Diagnosis evaluation error:', error);
    throw new Error('Failed to evaluate diagnosis');
  }
}

export async function generatePatientCase(lessonTitle: string): Promise<string> {
  if (!lessonTitle.trim()) {
    throw new Error('Lesson title cannot be empty');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'Gemini-1.5-pro' });
    
    const prompt = `Génère un cas clinique initial lié à "${lessonTitle}". 

Instructions :
- Le patient doit présenter des symptômes non spécifiques
- Ne donne que les informations initiales minimales
- Inclus l'âge et le sexe du patient
- Utilise un langage naturel
- Les symptômes doivent être décrits de manière vague
- N'inclus PAS le diagnostic
- Le patient ne doit PAS utiliser de termes médicaux techniques

Format : Une description à la première personne, comme si le patient se présentait.`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    return response;
  } catch (error) {
    console.error('Patient case generation error:', error);
    throw new Error('Failed to generate patient case');
  }
}

export async function getPatientResponse(
  question: string,
  lessonTitle: string,
  initialCase: string
): Promise<string> {
  if (!question.trim() || !lessonTitle.trim() || !initialCase.trim()) {
    throw new Error('Missing required parameters');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'Gemini-1.5-pro' });
    
    const prompt = `Tu es un patient qui présente le cas suivant :

${initialCase}

Question du médecin : ${question}

Instructions :
- Réponds de manière naturelle
- Ne révèle pas tous les symptômes d'un coup
- Utilise un langage simple, non médical
- Reste vague dans certaines réponses
- Si on te demande directement un symptôme, réponds honnêtement
- N'utilise jamais de termes médicaux techniques`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    return response;
  } catch (error) {
    console.error('Patient response error:', error);
    throw new Error('Failed to get patient response');
  }
}