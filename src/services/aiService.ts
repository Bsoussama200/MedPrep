import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lesson } from '../types/upload';

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
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .filter(p => p.trim())
      .join('\n\n');
  } catch (error) {
    console.error('AI response error:', error);
    return 'Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez reformuler votre question.';
  }
}

export async function generatePatientCase(lessonTitle: string): Promise<string> {
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
    return result.response.text();
  } catch (error) {
    console.error('Case generation error:', error);
    return 'Désolé, je ne peux pas générer de cas clinique pour le moment.';
  }
}

export async function getPatientResponse(question: string, lessonTitle: string, initialCase: string): Promise<string> {
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
    return result.response.text();
  } catch (error) {
    console.error('Patient response error:', error);
    return 'Désolé, je ne me sens pas très bien, pourriez-vous répéter la question ?';
  }
}

export async function evaluateDiagnosis(diagnosis: string, lessonTitle: string, initialCase: string): Promise<{
  isCorrect: boolean;
  explanation: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Check if the answer is a variation of "I don't know"
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
    const response = result.response.text();
    
    const verdictMatch = response.match(/VERDICT:\s*(CORRECT|INCORRECT)/i);
    const explanationMatch = response.match(/EXPLICATION:\s*([\s\S]*?)(?=---|$)/i);
    
    if (!verdictMatch || !explanationMatch) {
      throw new Error('Invalid response format');
    }

    return {
      isCorrect: verdictMatch[1].toUpperCase() === 'CORRECT',
      explanation: explanationMatch[1].trim()
    };
  } catch (error) {
    console.error('Diagnosis evaluation error:', error);
    return {
      isCorrect: false,
      explanation: "Une erreur est survenue lors de l'évaluation. Cependant, n'oubliez pas qu'un bon diagnostic doit toujours être basé sur une anamnèse complète, un examen clinique minutieux et une analyse systématique des symptômes. Continuez à pratiquer et à développer votre raisonnement clinique."
    };
  }
}

export async function evaluateProgress(lessons: Lesson[]): Promise<string> {
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
    const response = result.response.text();
    
    return response
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .filter(line => line.trim())
      .join('\n\n');
  } catch (error) {
    console.error('Progress evaluation error:', error);
    return "Une erreur est survenue lors de l'évaluation de votre progression. Veuillez réessayer plus tard.";
  }
}