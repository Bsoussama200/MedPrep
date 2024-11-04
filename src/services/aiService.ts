import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lesson } from '../types/upload';

const genAI = new GoogleGenerativeAI('AIzaSyCU14JKKhknlQ9pQ9GImlEbf6Tz58NUJyQ');

const handleAIError = (error: unknown, defaultMessage: string): never => {
  console.error('AI Service Error:', error);
  if (error instanceof Error) {
    throw new Error(`${defaultMessage}: ${error.message}`);
  }
  throw new Error(defaultMessage);
};

export async function getMedicalProfessorResponse(message: string, lessonTitle?: string): Promise<string> {
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

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
    if (!result || !result.response) {
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
    return handleAIError(error, 'Failed to get professor response');
  }
}

export async function generateQuizQuestion(lessonTitle: string, difficulty: number): Promise<{
  question: string;
  choices: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
}> {
  if (!lessonTitle.trim()) {
    throw new Error('Lesson title cannot be empty');
  }

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
    if (!result || !result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

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
        explanation += ' ' + line.trim();
      }
    }

    if (!question || choices.length !== 4 || !correctAnswer || !explanation) {
      throw new Error('Invalid quiz format received from AI');
    }

    const correctChoice = choices.find(c => c.id === correctAnswer);
    if (!correctChoice) {
      throw new Error('Invalid correct answer received from AI');
    }
    correctChoice.isCorrect = true;

    return { question, choices, explanation };
  } catch (error) {
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

export async function generatePatientCase(lessonTitle: string): Promise<string> {
  if (!lessonTitle.trim()) {
    throw new Error('Lesson title cannot be empty');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Génère un cas clinique initial lié à "${lessonTitle}". 

Instructions :
- Le patient doit présenter des symptômes non spécifiques qui pourraient correspondre à plusieurs pathologies
- Ne donne que les informations initiales minimales
- Le patient ne doit pas mentionner tous ses symptômes dès le début
- Inclus l'âge et le sexe du patient
- Utilise un langage naturel, comme si le patient se présentait lui-même
- Les symptômes doivent être décrits de manière vague par le patient
- N'inclus PAS le diagnostic dans la description
- Le patient ne doit PAS utiliser de termes médicaux techniques
- Le cas doit nécessiter plus de questions pour établir un diagnostic

Format : Une description à la première personne, comme si le patient se présentait.

Exemple de structure :
"Bonjour docteur, je suis [prénom], j'ai [âge] ans. Je viens vous voir car depuis quelque temps je me sens [symptôme principal vague]. [1-2 autres symptômes non spécifiques]."`;

    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    return response;
  } catch (error) {
    return handleAIError(error, 'Failed to generate patient case');
  }
}

export async function getPatientResponse(question: string, lessonTitle: string, initialCase: string): Promise<string> {
  if (!question.trim() || !lessonTitle.trim() || !initialCase.trim()) {
    throw new Error('Missing required parameters');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Tu es un patient qui présente le cas suivant :

${initialCase}

Instructions pour répondre à la question du médecin :
- Réponds de manière naturelle, comme un vrai patient
- Ne révèle pas tous les symptômes d'un coup
- Utilise un langage simple, non médical
- Reste vague dans certaines réponses
- Si le médecin ne pose pas la bonne question, ne donne pas l'information
- Ajoute parfois des détails non pertinents comme le ferait un vrai patient
- Si on te demande directement si tu as un symptôme spécifique, réponds honnêtement
- N'utilise jamais de termes médicaux techniques

Question du médecin : ${question}`;

    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }

    return response;
  } catch (error) {
    return handleAIError(error, 'Failed to get patient response');
  }
}

export async function evaluateDiagnosis(diagnosis: string, lessonTitle: string, initialCase: string): Promise<{
  isCorrect: boolean;
  explanation: string;
}> {
  if (!diagnosis.trim() || !lessonTitle.trim() || !initialCase.trim()) {
    throw new Error('Missing required parameters');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const dontKnowVariants = [
      "je ne sais pas",
      "je sais pas",
      "pas sûr",
      "pas sure",
      "incertain",
      "incertaine",
      "difficile à dire",
      "impossible à dire",
      "je ne peux pas dire"
    ];

    const isUnsureAnswer = dontKnowVariants.some(variant => 
      diagnosis.toLowerCase().includes(variant)
    );

    if (isUnsureAnswer) {
      return {
        isCorrect: false,
        explanation: `Il est compréhensible d'avoir des doutes, et c'est une bonne chose de reconnaître quand on n'est pas sûr. Cependant, en tant que médecin, même face à l'incertitude, vous devez :

1. Formuler des hypothèses diagnostiques basées sur les symptômes présentés
2. Proposer une démarche diagnostique pour confirmer ou infirmer ces hypothèses
3. Identifier les urgences potentielles qui nécessitent une prise en charge immédiate

Je vous encourage à reprendre l'interrogatoire, analyser les symptômes présentés, et proposer au moins une hypothèse diagnostique, même si vous n'êtes pas certain(e). C'est ainsi que vous développerez votre raisonnement clinique.`
      };
    }
    
    const prompt = `En tant que professeur de médecine expérimenté, évalue le diagnostic proposé par l'étudiant avec une attention particulière à la justification et aux informations disponibles.

Cas clinique initial :
${initialCase}

Diagnostic proposé par l'étudiant :
${diagnosis}

Contexte : Leçon sur "${lessonTitle}"

Critères d'évaluation stricts :
1. L'étudiant doit justifier son diagnostic avec les informations DÉJÀ OBTENUES
2. Un diagnostic sans justification ou basé sur des suppositions doit être considéré comme INCORRECT
3. Un diagnostic correct mais précipité (sans avoir recueilli assez d'informations) doit être considéré comme INCORRECT
4. L'étudiant doit démontrer un raisonnement clinique basé sur les symptômes et signes disponibles
5. Les diagnostics différentiels doivent être considérés

Ta réponse doit suivre ce format :
---
VERDICT: [INCORRECT] (Par défaut, considérer incorrect sauf si vraiment bien justifié)
EXPLICATION:
[Explication détaillée incluant :
- Analyse du raisonnement
- Informations manquantes cruciales
- Ce qui aurait dû être fait avant de proposer un diagnostic
- Suggestions pour améliorer la démarche diagnostique]
---`;

    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('Invalid AI response');
    }

    const response = result.response.text();
    if (!response) {
      throw new Error('Empty response from AI');
    }
    
    const verdictMatch = response.match(/VERDICT:\s*(CORRECT|INCORRECT)/i);
    const explanationMatch = response.match(/EXPLICATION:\s*([\s\S]*?)(?=---|$)/i);
    
    if (!verdictMatch || !explanationMatch) {
      throw new Error('Invalid response format from AI');
    }

    return {
      isCorrect: verdictMatch[1].toUpperCase() === 'CORRECT',
      explanation: explanationMatch[1].trim()
    };
  } catch (error) {
    return {
      isCorrect: false,
      explanation: "Une erreur est survenue lors de l'évaluation. Cependant, n'oubliez pas qu'un bon diagnostic doit toujours être basé sur une anamnèse complète, un examen clinique minutieux et une analyse systématique des symptômes. Continuez à pratiquer et à développer votre raisonnement clinique."
    };
  }
}

export async function evaluateProgress(lessons: Lesson[]): Promise<string> {
  if (!lessons || lessons.length === 0) {
    throw new Error('No lessons provided for evaluation');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
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
    if (!result || !result.response) {
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
    return handleAIError(error, 'Failed to evaluate progress');
  }
}