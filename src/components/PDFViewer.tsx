import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

interface PDFViewerProps {
  url: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadedPages, setLoadedPages] = useState(0);

  const getLessonContent = () => {
    if (title === "Les Accidents Vasculaires Cérébraux") {
      return `Cours De Résidanat
Sujet : 1
Les Accidents Vasculaires Cérébraux
Étiopathogénie, Physiopathologie, Diagnostic, Traitement

Objectifs :
3. Décrire la vascularisation artérielle et veineuse de l'encéphale.
4. Décrire la somatotopie corticale des aires corticales primaires motrices
et somesthésiques.
5. Décrire les mécanismes de régulation du débit sanguin cérébral.
6. Expliquer la physiopathologie de l'accident vasculaire cérébral ischémique.
7. Citer les facteurs de risque d'un accident vasculaire cérébral ischémique et
hémorragique.
8. Établir le diagnostic topographique de l'accident vasculaire cérébral
ischémique et hémorragique à partir des données cliniques et radiologiques.
9. Établir le diagnostic topographique de la thrombose veineuse cérébrale à
partir des données cliniques et radiologiques.
10. Identifier les étiologies de l'accident vasculaire cérébral ischémique et
hémorragique selon l'âge.
11. Planifier la prise en charge thérapeutique à la phase aiguë de l'accident
vasculaire cérébral ischémique et hémorragique.
12. Planifier la prise en charge au long cours et les mesures préventives des
accidents vasculaires cérébraux ischémique et hémorragique.`;
    }
    return `Cours De Résidanat
${title}

Le contenu du cours sera bientôt disponible.`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center p-4 border-b bg-white">
        <FileText className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">{title || 'Document PDF'}</h2>
      </div>

      <div className="flex-1 relative">
        <div className="p-6 whitespace-pre-line">
          {getLessonContent()}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;