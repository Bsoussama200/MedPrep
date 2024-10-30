import { create } from 'zustand';
import { Lesson } from './types/upload';

interface Store {
  lessons: Lesson[];
  updateProgress: (id: string, progress: number) => void;
  resetProgress: (id: string) => void;
}

const lessonContent = `Cours De Résidanat
Sujet : 1
Les Accidents Vasculaires Cérébraux
Étiopathogénie, Physiopathologie, Diagnostic, Traitement

Objectifs :
3. Décrire la vascularisation artérielle et veineuse de l'encéphale.
4. Décrire la somatotopie corticale des aires corticales primaires motrices et somesthésiques.
5. Décrire les mécanismes de régulation du débit sanguin cérébral.
6. Expliquer la physiopathologie de l'accident vasculaire cérébral ischémique.
7. Citer les facteurs de risque d'un accident vasculaire cérébral ischémique et hémorragique.
8. Établir le diagnostic topographique de l'accident vasculaire cérébral ischémique et hémorragique à partir des données cliniques et radiologiques.
9. Établir le diagnostic topographique de la thrombose veineuse cérébrale à partir des données cliniques et radiologiques.
10. Identifier les étiologies de l'accident vasculaire cérébral ischémique et hémorragique selon l'âge.
11. Planifier la prise en charge thérapeutique à la phase aiguë de l'accident vasculaire cérébral ischémique et hémorragique.
12. Planifier la prise en charge au long cours et les mesures préventives des accidents vasculaires cérébraux ischémique et hémorragique.`;

const lessonTitles = [
  "Les Accidents Vasculaires Cérébraux",
  "Adénopathies superficielles",
  "Les Anémies",
  "Appendicite Aigue",
  "Arrêt cardio-circulatoire",
  "Arthrite septique",
  "Asthme de l'adulte et de l'enfant",
  "Bronchiolite du nourrisson",
  "Broncho pneumopathie chronique obstructive",
  "Brûlures Cutanées Récentes",
  "Les cancers broncho-pulmonaires primitifs",
  "Cancer du cavum",
  "Cancer du col de l'utérus",
  "Cancer du sein",
  "Cancers colorectaux",
  "Céphalées",
  "Coma",
  "Déshydratations aigues de l'enfant",
  "Contraception",
  "Diabète sucré",
  "Diarrhées chroniques",
  "Douleurs thoraciques aigues",
  "Les dyslipidémies",
  "Dysphagies",
  "L'endocardite infectieuse",
  "Epilepsies",
  "Choc cardiogénique",
  "L'état de choc hémorragique",
  "Les états confusionnels",
  "Les états septiques graves",
  "Fractures ouvertes de la jambe",
  "Grossesse extra-utérine",
  "Les hématuries",
  "Les hémorragies digestives",
  "Hépatites virales",
  "Hydatidoses hépatiques et pulmonaires",
  "Hypercalcémies",
  "Hypertension artérielle",
  "Les hyperthyroïdies",
  "Les hypothyroidies de l'adulte et de l'enfant",
  "Les ictères",
  "Infection des voies aériennes supérieures",
  "Infections respiratoires basses communautaires",
  "Infections sexuellement transmissibles",
  "Infections Urinaires",
  "Insuffisance rénale aigue",
  "L'insuffisance surrénalienne aigue",
  "Intoxications par le CO, les organophosphorés et les psychotropes",
  "Ischémie aiguë des membres",
  "Lithiase urinaire",
  "Maladies veineuses thrombo-emboliques",
  "Méningites bactériennes et virales",
  "Diagnostic des métrorragies",
  "Occlusions intestinales aiguës",
  "Les oedèmes",
  "OEil rouge",
  "Péritonites aigues",
  "Polyarthrite Rhumatoïde",
  "Polytraumatisme",
  "Préeclampsie et éclampsie",
  "Prise en charge de la douleur aigue",
  "Les Purpuras",
  "Schizophrénie",
  "Splénomégalies",
  "Syndromes coronariens aigus",
  "Transfusion sanguine",
  "Traumatismes crâniens",
  "Troubles acido-basiques",
  "Troubles anxieux",
  "Trouble de l'humeur",
  "Les troubles de l'hydratation",
  "Dyskaliémies",
  "Tuberculose pulmonaire commune",
  "Les Tumeurs de la prostate",
  "L'ulcère gastrique et duodénal",
  "Vaccinations"
];

const initialLessons: Lesson[] = lessonTitles.map((title, i) => ({
  id: `lesson-${i + 1}`,
  title,
  progress: Math.floor(Math.random() * 100),
  quizzesTaken: Math.floor(Math.random() * 5),
  lastAttempt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  pdfUrl: i === 0 ? '/pdfs/lesson-1.pdf' : undefined,
  content: i === 0 ? lessonContent : undefined
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