import { create } from 'zustand';
import { Lesson, Theme } from './types/upload';

interface Store {
  lessons: Lesson[];
  updateProgress: (id: string, progress: number) => void;
  resetProgress: (id: string) => void;
}

const createPlaceholderContent = (title: string) => `OBJECTIFS

1- Définir ${title}
2- Reconnaître les caractéristiques cliniques
3- Établir le diagnostic différentiel
4- Identifier les signes de gravité
5- Hiérarchiser les examens complémentaires
6- Établir le diagnostic étiologique

Introduction :
✓ Définition et physiopathologie
✓ Aspects cliniques principaux
✓ Démarche diagnostique
✓ Principes thérapeutiques`;

// Theme mapping for lessons
const themeMapping: { [key: string]: string } = {
  "Les Accidents Vasculaires Cérébraux": "Neurologie-Neurochirurgie",
  "Adénopathies superficielles": "Chirurgie générale",
  "Les Anémies": "Gastrologie",
  "Appendicite Aigue": "Chirurgie générale",
  "Arrêt cardio-circulatoire": "Cardiologie",
  "Arthrite septique": "Chirurgie générale",
  "Asthme de l'adulte et de l'enfant": "Pneumo-allergologie",
  "Bronchiolite du nourrisson": "Pneumo-allergologie",
  "Broncho pneumopathie chronique obstructive": "Pneumo-allergologie",
  "Brûlures Cutanées Récentes": "Chirurgie générale",
  "Les cancers broncho-pulmonaires primitifs": "Pneumo-allergologie",
  "Cancer du cavum": "ORL",
  "Cancer du col de l'utérus": "Gynécologie",
  "Cancer du sein": "Gynécologie",
  "Cancers colorectaux": "Gastrologie",
  "Céphalées": "Neurologie-Neurochirurgie",
  "Coma": "Neurologie-Neurochirurgie",
  "Déshydratations aigues de l'enfant": "Gastrologie",
  "Contraception": "Gynécologie",
  "Diabète sucré": "Gastrologie",
  "Diarrhées chroniques": "Gastrologie",
  "Douleurs thoraciques aigues": "Cardiologie",
  "Les dyslipidémies": "Cardiologie",
  "Dysphagies": "ORL",
  "L'endocardite infectieuse": "Cardiologie",
  "Epilepsies": "Neurologie-Neurochirurgie",
  "Choc cardiogénique": "Cardiologie",
  "L'état de choc hémorragique": "Chirurgie générale",
  "Les états confusionnels": "Psychiatrie",
  "Les états septiques graves": "Chirurgie générale",
  "Fractures ouvertes de la jambe": "Chirurgie générale",
  "Grossesse extra-utérine": "Gynécologie",
  "Les hématuries": "Chirurgie générale",
  "Les hémorragies digestives": "Gastrologie",
  "Hépatites virales": "Gastrologie",
  "Hydatidoses hépatiques et pulmonaires": "Pneumo-allergologie",
  "Hypercalcémies": "Gastrologie",
  "Hypertension artérielle": "Cardiologie",
  "Les hyperthyroïdies": "Gastrologie",
  "Les hypothyroidies de l'adulte et de l'enfant": "Gastrologie",
  "Les ictères": "Gastrologie",
  "Infection des voies aériennes supérieures": "ORL",
  "Infections respiratoires basses communautaires": "Pneumo-allergologie",
  "Infections sexuellement transmissibles": "Gynécologie",
  "Infections Urinaires": "Chirurgie générale",
  "Insuffisance rénale aigue": "Chirurgie générale",
  "L'insuffisance surrénalienne aigue": "Gastrologie",
  "Intoxications par le CO, les organophosphorés et les psychotropes": "Psychiatrie",
  "Ischémie aiguë des membres": "Chirurgie générale",
  "Lithiase urinaire": "Chirurgie générale",
  "Maladies veineuses thrombo-emboliques": "Cardiologie",
  "Méningites bactériennes et virales": "Neurologie-Neurochirurgie",
  "Diagnostic des métrorragies": "Gynécologie",
  "Occlusions intestinales aiguës": "Chirurgie générale",
  "Les oedèmes": "Cardiologie",
  "OEil rouge": "Ophtalmologie",
  "Péritonites aigues": "Chirurgie générale",
  "Polyarthrite Rhumatoïde": "Chirurgie générale",
  "Polytraumatisme": "Chirurgie générale",
  "Préeclampsie et éclampsie": "Gynécologie",
  "Prise en charge de la douleur aigue": "Chirurgie générale",
  "Les Purpuras": "Gastrologie",
  "Schizophrénie": "Psychiatrie",
  "Splénomégalies": "Gastrologie",
  "Syndromes coronariens aigus": "Cardiologie",
  "Transfusion sanguine": "Gastrologie",
  "Traumatismes crâniens": "Neurologie-Neurochirurgie",
  "Troubles acido-basiques": "Gastrologie",
  "Troubles anxieux": "Psychiatrie",
  "Trouble de l'humeur": "Psychiatrie",
  "Les troubles de l'hydratation": "Gastrologie",
  "Dyskaliémies": "Gastrologie",
  "Tuberculose pulmonaire commune": "Pneumo-allergologie",
  "Les Tumeurs de la prostate": "Chirurgie générale",
  "L'ulcère gastrique et duodénal": "Gastrologie",
  "Vaccinations": "Gastrologie"
};

const lessonTitles = Object.keys(themeMapping);

const initialLessons: Lesson[] = lessonTitles.map((title, i) => ({
  id: `lesson-${i + 1}`,
  title,
  progress: Math.floor(Math.random() * 100),
  quizzesTaken: Math.floor(Math.random() * 5),
  lastAttempt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  pdfUrl: undefined,
  content: createPlaceholderContent(title),
  theme: themeMapping[title]
}));

export const useStore = create<Store>((set) => ({
  lessons: initialLessons,
  updateProgress: (id, progress) =>
    set((state) => ({
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, progress } : lesson
      ),
    })),
  resetProgress: (id) =>
    set((state) => ({
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, progress: 0, quizzesTaken: 0 } : lesson
      ),
    })),
}));