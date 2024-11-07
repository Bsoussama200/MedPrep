import { create } from 'zustand';

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  choices: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

interface QuestionStore {
  questions: QuizQuestion[];
}

const questionBank: QuizQuestion[] = [
  // Les Accidents Vasculaires Cérébraux
  {
    id: 'avc-1',
    lessonId: 'lesson-1',
    question: "Quel est le délai maximal pour administrer un traitement thrombolytique dans un AVC ischémique ?",
    choices: [
      { id: 'A', text: "2 heures", isCorrect: false },
      { id: 'B', text: "4.5 heures", isCorrect: true },
      { id: 'C', text: "6 heures", isCorrect: false },
      { id: 'D', text: "8 heures", isCorrect: false }
    ],
    explanation: "Le délai de 4.5 heures est le délai maximal reconnu pour l'administration d'un traitement thrombolytique dans l'AVC ischémique, au-delà duquel les risques dépassent les bénéfices potentiels."
  },
  {
    id: 'avc-2',
    lessonId: 'lesson-1',
    question: "Quel signe clinique n'est PAS typique d'un AVC ?",
    choices: [
      { id: 'A', text: "Hémiplégie brutale", isCorrect: false },
      { id: 'B', text: "Aphasie", isCorrect: false },
      { id: 'C', text: "Douleur thoracique intense", isCorrect: true },
      { id: 'D', text: "Trouble de la vision unilatérale", isCorrect: false }
    ],
    explanation: "La douleur thoracique intense n'est pas un signe typique d'AVC. Elle est plutôt caractéristique d'un syndrome coronarien aigu."
  },
  {
    id: 'avc-3',
    lessonId: 'lesson-1',
    question: "Quelle imagerie est indispensable en urgence devant une suspicion d'AVC ?",
    choices: [
      { id: 'A', text: "IRM cérébrale", isCorrect: false },
      { id: 'B', text: "Scanner cérébral sans injection", isCorrect: true },
      { id: 'C', text: "Échographie doppler", isCorrect: false },
      { id: 'D', text: "Artériographie", isCorrect: false }
    ],
    explanation: "Le scanner cérébral sans injection est l'examen de première intention car il permet rapidement d'éliminer une hémorragie cérébrale et d'orienter la prise en charge thérapeutique."
  },

  // Adénopathies superficielles
  {
    id: 'adeno-1',
    lessonId: 'lesson-2',
    question: "Quelle est la taille minimale d'un ganglion pour être considéré comme pathologique ?",
    choices: [
      { id: 'A', text: "0.5 cm", isCorrect: false },
      { id: 'B', text: "1 cm", isCorrect: true },
      { id: 'C', text: "2 cm", isCorrect: false },
      { id: 'D', text: "3 cm", isCorrect: false }
    ],
    explanation: "Un ganglion est considéré comme pathologique lorsque son plus grand diamètre dépasse 1 cm, sauf exceptions (ganglions inguinaux : 1,5 cm)."
  },
  {
    id: 'adeno-2',
    lessonId: 'lesson-2',
    question: "Quelle caractéristique évoque la malignité d'une adénopathie ?",
    choices: [
      { id: 'A', text: "Mobile et sensible", isCorrect: false },
      { id: 'B', text: "Dure et fixée", isCorrect: true },
      { id: 'C', text: "Molle et mobile", isCorrect: false },
      { id: 'D', text: "Douloureuse et inflammatoire", isCorrect: false }
    ],
    explanation: "Une adénopathie dure et fixée aux plans profonds est très évocatrice de malignité, contrairement aux adénopathies inflammatoires qui sont plutôt mobiles et sensibles."
  },
  {
    id: 'adeno-3',
    lessonId: 'lesson-2',
    question: "Quelle est la principale cause d'adénopathie cervicale chez l'enfant ?",
    choices: [
      { id: 'A', text: "Infection virale ORL", isCorrect: true },
      { id: 'B', text: "Lymphome", isCorrect: false },
      { id: 'C', text: "Tuberculose", isCorrect: false },
      { id: 'D', text: "Métastase", isCorrect: false }
    ],
    explanation: "Les infections virales ORL sont la cause la plus fréquente d'adénopathies cervicales chez l'enfant, généralement bénignes et transitoires."
  },

  // Les Anémies
  {
    id: 'anemie-1',
    lessonId: 'lesson-3',
    question: "Quel est le seuil d'hémoglobine définissant l'anémie chez l'homme adulte ?",
    choices: [
      { id: 'A', text: "13 g/dL", isCorrect: true },
      { id: 'B', text: "12 g/dL", isCorrect: false },
      { id: 'C', text: "11 g/dL", isCorrect: false },
      { id: 'D', text: "10 g/dL", isCorrect: false }
    ],
    explanation: "L'anémie est définie chez l'homme adulte par un taux d'hémoglobine inférieur à 13 g/dL selon l'OMS."
  },
  {
    id: 'anemie-2',
    lessonId: 'lesson-3',
    question: "Quelle est la cause la plus fréquente d'anémie dans le monde ?",
    choices: [
      { id: 'A', text: "Carence en B12", isCorrect: false },
      { id: 'B', text: "Carence en fer", isCorrect: true },
      { id: 'C', text: "Thalassémie", isCorrect: false },
      { id: 'D', text: "Insuffisance rénale", isCorrect: false }
    ],
    explanation: "La carence en fer est la cause la plus fréquente d'anémie dans le monde, touchant particulièrement les femmes en âge de procréer et les enfants."
  },
  {
    id: 'anemie-3',
    lessonId: 'lesson-3',
    question: "Quel paramètre permet de différencier une anémie microcytaire d'une anémie normocytaire ?",
    choices: [
      { id: 'A', text: "VGM", isCorrect: true },
      { id: 'B', text: "CCMH", isCorrect: false },
      { id: 'C', text: "Réticulocytes", isCorrect: false },
      { id: 'D', text: "Ferritine", isCorrect: false }
    ],
    explanation: "Le Volume Globulaire Moyen (VGM) permet de classer les anémies : microcytaire (VGM < 80 fL), normocytaire (80-100 fL) ou macrocytaire (> 100 fL)."
  },

  // Appendicite Aigue
  {
    id: 'append-1',
    lessonId: 'lesson-4',
    question: "Quel est le signe clinique le plus caractéristique de l'appendicite aiguë ?",
    choices: [
      { id: 'A', text: "Douleur épigastrique", isCorrect: false },
      { id: 'B', text: "Douleur en fosse iliaque droite", isCorrect: true },
      { id: 'C', text: "Douleur en fosse iliaque gauche", isCorrect: false },
      { id: 'D', text: "Douleur péri-ombilicale", isCorrect: false }
    ],
    explanation: "La douleur en fosse iliaque droite est le signe clinique le plus caractéristique de l'appendicite aiguë, souvent précédée d'une douleur péri-ombilicale."
  },
  {
    id: 'append-2',
    lessonId: 'lesson-4',
    question: "Quel examen d'imagerie est recommandé en première intention chez l'adulte ?",
    choices: [
      { id: 'A', text: "Scanner abdominal", isCorrect: false },
      { id: 'B', text: "Échographie abdominale", isCorrect: true },
      { id: 'C', text: "IRM abdominale", isCorrect: false },
      { id: 'D', text: "ASP", isCorrect: false }
    ],
    explanation: "L'échographie abdominale est l'examen de première intention, particulièrement chez les sujets jeunes et les femmes enceintes, en raison de son caractère non irradiant et de sa bonne sensibilité."
  },
  {
    id: 'append-3',
    lessonId: 'lesson-4',
    question: "Quelle est la principale complication de l'appendicite aiguë non traitée ?",
    choices: [
      { id: 'A', text: "Péritonite", isCorrect: true },
      { id: 'B', text: "Occlusion intestinale", isCorrect: false },
      { id: 'C', text: "Hémorragie digestive", isCorrect: false },
      { id: 'D', text: "Perforation gastrique", isCorrect: false }
    ],
    explanation: "La péritonite par perforation appendiculaire est la complication majeure d'une appendicite non traitée, pouvant engager le pronostic vital."
  }
];

export const useQuestionStore = create<QuestionStore>(() => ({
  questions: questionBank
}));