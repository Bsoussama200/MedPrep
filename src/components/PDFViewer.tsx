import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle, Play, PauseCircle, UserCircle, Bolt } from 'lucide-react';
import QuizConfigModal from './QuizConfigModal';
import QuizQuestion from './QuizQuestion';
import MedicalCase from './MedicalCase';
import { generateQuizQuestion } from '../services/quizService';
import { generatePatientCase } from '../services/aiService';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

interface PDFViewerProps {
  url?: string;
  title?: string;
  content?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadedPages, setLoadedPages] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1.5);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<{
    question: string;
    choices: Array<{ id: string; text: string; isCorrect: boolean }>;
    explanation: string;
  } | null>(null);
  const [quizConfig, setQuizConfig] = useState<{ questions: number; difficulty: number } | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [showMedicalCase, setShowMedicalCase] = useState(false);
  const [medicalCaseData, setMedicalCaseData] = useState<{ initialCase: string } | null>(null);
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);

  const toggleReading = () => {
    setIsReading(!isReading);
    if (!isReading) {
      const textToRead = content || containerRef.current?.textContent;
      if (textToRead) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'fr-FR';
        utterance.rate = readingSpeed;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      }
    } else {
      speechSynthesis.cancel();
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setReadingSpeed(newSpeed);
    if (isReading) {
      speechSynthesis.cancel();
      const textToRead = content || containerRef.current?.textContent;
      if (textToRead) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'fr-FR';
        utterance.rate = newSpeed;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleStartMedicalCase = async () => {
    if (!title || isGeneratingCase) return;
    
    setIsGeneratingCase(true);
    try {
      const initialCase = await generatePatientCase(title);
      setMedicalCaseData({ initialCase });
      setShowMedicalCase(true);
    } catch (error) {
      console.error('Failed to generate medical case:', error);
    } finally {
      setIsGeneratingCase(false);
    }
  };

  const handleStartQuiz = async (config: { questions: number; difficulty: number }) => {
    setQuizConfig(config);
    setShowQuizModal(false);
    setCurrentQuestionNumber(1);
    
    try {
      const question = await generateQuizQuestion(title || '', config.difficulty);
      setCurrentQuizQuestion(question);
    } catch (error) {
      console.error('Failed to generate quiz question:', error);
    }
  };

  const handleNextQuestion = async () => {
    if (!quizConfig) return;

    if (currentQuestionNumber < quizConfig.questions) {
      setCurrentQuestionNumber(prev => prev + 1);
      try {
        const question = await generateQuizQuestion(title || '', quizConfig.difficulty);
        setCurrentQuizQuestion(question);
      } catch (error) {
        console.error('Failed to generate next question:', error);
      }
    } else {
      setCurrentQuizQuestion(null);
      setQuizConfig(null);
      setCurrentQuestionNumber(1);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const loadPDF = async () => {
      if (!containerRef.current) return;
      
      if (content) {
        if (isMounted) {
          containerRef.current.innerHTML = '';
          const contentDiv = document.createElement('div');
          contentDiv.className = 'p-6 whitespace-pre-wrap font-serif text-lg leading-relaxed';
          contentDiv.textContent = content;
          containerRef.current.appendChild(contentDiv);
          setLoading(false);
        }
        return;
      }
      
      if (!url) {
        setLoading(false);
        return;
      }
      
      if (isMounted) {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        setLoadedPages(0);
        setTotalPages(0);
      }

      try {
        loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
          withCredentials: false,
          rangeChunkSize: 65536,
        });

        loadingTask.onProgress = (data) => {
          if (isMounted && data.total > 0) {
            const progress = (data.loaded / data.total) * 100;
            setLoadingProgress(Math.round(progress));
          }
        };

        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        setTotalPages(pdf.numPages);
        
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.0 });
        const containerWidth = container.clientWidth - 48;
        const initialScale = containerWidth / viewport.width;
        if (isMounted) setScale(initialScale);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (!isMounted) break;

          const page = await pdf.getPage(pageNum);
          const scaledViewport = page.getViewport({ scale: initialScale });

          const pageWrapper = document.createElement('div');
          pageWrapper.className = 'mb-6 px-6';

          const canvas = document.createElement('canvas');
          canvas.className = 'mx-auto shadow-lg rounded';
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          const context = canvas.getContext('2d');
          if (!context) throw new Error('Cannot get canvas context');

          pageWrapper.appendChild(canvas);
          container.appendChild(pageWrapper);

          await page.render({
            canvasContext: context,
            viewport: scaledViewport,
          }).promise;

          const pageNumber = document.createElement('div');
          pageNumber.className = 'text-center text-sm text-gray-500 mt-2';
          pageNumber.textContent = `Page ${pageNum} sur ${pdf.numPages}`;
          pageWrapper.appendChild(pageNumber);

          if (isMounted) {
            setLoadedPages(pageNum);
            setLoadingProgress((pageNum / pdf.numPages) * 100);
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Impossible de charger le PDF. Le fichier pourrait être protégé ou inaccessible.');
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      if (loadingTask) {
        loadingTask.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, content]);

  if (!url && !content && !title) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Sélectionnez une leçon pour commencer</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-900">{title || 'Document'}</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative flex">
            <button
              onClick={toggleReading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm border-r-0"
              title="Lecture audio"
            >
              {isReading ? (
                <>
                  <PauseCircle className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600">Écouter</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowSpeedControl(!showSpeedControl)}
              className="px-2 py-1.5 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Bolt className="h-4 w-4 text-indigo-600" />
            </button>
            {showSpeedControl && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 border z-10 min-w-[200px]">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vitesse de lecture: {readingSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm"
            title="Commencer un quiz"
          >
            <span className="font-bold text-indigo-600">QCM</span>
          </button>
          <button
            onClick={handleStartMedicalCase}
            disabled={isGeneratingCase}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm"
            title="Simuler un cas clinique"
          >
            <UserCircle className={`h-4 w-4 text-indigo-600 ${isGeneratingCase ? 'animate-pulse' : ''}`} />
            <span className="text-indigo-600">Cas clinique</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-full bg-red-50 rounded-lg p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          {url && (
            <p className="text-sm text-gray-600 text-center">
              Essayez de télécharger le PDF directement depuis:{' '}
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                ce lien
              </a>
            </p>
          )}
        </div>
      ) : loading && !content ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
          
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Chargement : {Math.round(loadingProgress)}%
          </div>

          {totalPages > 0 && (
            <div className="text-sm text-gray-600">
              Rendu des pages : {loadedPages} sur {totalPages}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-full bg-gray-50">
          <div 
            ref={containerRef}
            className="w-full h-full overflow-y-auto pdf-container"
          />
          {!content && (
            <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 items-center">
              <button
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                className="p-2 hover:bg-gray-100 rounded text-gray-700"
              >
                -
              </button>
              <span className="px-2 min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(s => Math.min(2, s + 0.1))}
                className="p-2 hover:bg-gray-100 rounded text-gray-700"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}

      {showQuizModal && title && (
        <QuizConfigModal
          title={title}
          onClose={() => setShowQuizModal(false)}
          onStart={handleStartQuiz}
        />
      )}

      {currentQuizQuestion && title && (
        <QuizQuestion
          title={title}
          currentQuestion={currentQuestionNumber}
          totalQuestions={quizConfig?.questions || 0}
          question={currentQuizQuestion.question}
          choices={currentQuizQuestion.choices}
          explanation={currentQuizQuestion.explanation}
          onNext={handleNextQuestion}
          onClose={() => {
            setCurrentQuizQuestion(null);
            setQuizConfig(null);
            setCurrentQuestionNumber(1);
          }}
        />
      )}

      {showMedicalCase && medicalCaseData && title && (
        <MedicalCase
          title={title}
          initialCase={medicalCaseData.initialCase}
          onClose={() => {
            setShowMedicalCase(false);
            setMedicalCaseData(null);
          }}
        />
      )}
    </div>
  );
};

export default PDFViewer;