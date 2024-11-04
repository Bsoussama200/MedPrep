import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Split from 'react-split';
import { MessageSquare, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import { useStore } from '../store';
import { getMedicalProfessorResponse } from '../services/aiService';
import TextMarker from '../components/TextMarker';
import MarkerSettings from '../components/MarkerSettings';
import MarkedTextViewer from '../components/MarkedTextViewer';

interface MarkerColor {
  color: string;
  label: string;
  bgColor: string;
}

interface MarkedText {
  text: string;
  color: MarkerColor;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  "Faites-moi un résumé de la leçon",
  "Quels sont les points clés à retenir ?",
  "Expliquez-moi les concepts difficiles",
  "Donnez-moi des exemples pratiques"
];

const DEFAULT_MARKER_COLORS: MarkerColor[] = [
  { color: '#FFD700', label: 'Important', bgColor: '#FFD70033' },
  { color: '#FF69B4', label: 'À retenir', bgColor: '#FF69B433' },
  { color: '#32CD32', label: 'Définition', bgColor: '#32CD3233' },
  { color: '#87CEEB', label: 'Exemple', bgColor: '#87CEEB33' },
];

function LessonView() {
  const { id } = useParams<{ id: string }>();
  const { lessons } = useStore();
  const lesson = lessons.find(l => l.id === id);
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([]);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const [showMarkerSettings, setShowMarkerSettings] = useState(false);
  const [markerColors, setMarkerColors] = useState<MarkerColor[]>(DEFAULT_MARKER_COLORS);
  const [markedTexts, setMarkedTexts] = useState<MarkedText[]>([]);
  const [showMarkedTexts, setShowMarkedTexts] = useState(false);
  const [selectedViewColor, setSelectedViewColor] = useState<MarkerColor | undefined>();

  useEffect(() => {
    if (lesson) {
      setChatMessages([{
        role: 'assistant',
        content: `Bonjour! Je suis votre assistant pour le cours "${lesson.title}". Je peux vous aider à comprendre les concepts, répondre à vos questions et fournir des explications détaillées. Comment puis-je vous aider aujourd'hui ?`
      }]);
    }
  }, [lesson]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMarkerPosition({
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY,
        });
      } else {
        setMarkerPosition(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleSendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim() || isLoading || !lesson) return;

    setMessage('');
    setIsLoading(true);

    setChatMessages(prev => [...prev, { role: 'user', content: messageToSend }]);

    try {
      const response = await getMedicalProfessorResponse(messageToSend, lesson.title);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setChatMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez réessayer.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  const handleSuggestedQuestion = (question: string) => {
    setShowSuggestions(false);
    handleSendMessage(question);
  };

  const handleColorSelect = (color: MarkerColor) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString();
      setMarkedTexts(prev => [...prev, {
        text,
        color,
        timestamp: Date.now(),
      }]);
      
      // Create a mark element
      const mark = document.createElement('mark');
      mark.style.backgroundColor = color.bgColor;
      mark.style.color = 'inherit';
      
      const range = selection.getRangeAt(0);
      range.surroundContents(mark);
    }
    setMarkerPosition(null);
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));
  };

  if (!lesson) {
    return <div>Leçon non trouvée</div>;
  }

  return (
    <div className="h-[calc(100vh-5rem)] mx-4">
      <Split 
        sizes={[70, 30]} 
        minSize={[400, 300]}
        gutterSize={8}
        className="flex h-full"
        gutter={() => {
          const gutter = document.createElement('div');
          gutter.className = 'gutter-horizontal';
          return gutter;
        }}
      >
        <div className="h-full overflow-hidden bg-white rounded-lg shadow-sm">
          <PDFViewer 
            url={lesson.pdfUrl} 
            title={lesson.title} 
            content={lesson.content}
            onShowMarkedTexts={() => setShowMarkedTexts(true)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Assistant Médical IA</h2>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-indigo-50 text-indigo-900 ml-4' 
                    : msg.role === 'assistant'
                    ? 'bg-gray-50 text-gray-900 mr-4'
                    : 'bg-red-50 text-red-900'
                }`}
              >
                {formatMessageContent(msg.content)}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-pulse text-gray-400">En train de répondre...</div>
              </div>
            )}
          </div>

          <div className="relative">
            <div
              onMouseEnter={() => setShowSuggestions(true)}
              onMouseLeave={() => setShowSuggestions(false)}
              className="mb-2 flex justify-center"
            >
              <button
                className="text-sm bg-gray-50 text-gray-600 py-1.5 px-3 rounded flex items-center hover:bg-gray-100 transition-colors"
              >
                Questions suggérées
                {showSuggestions ? (
                  <ChevronDown className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronUp className="ml-1 h-3 w-3" />
                )}
              </button>

              {showSuggestions && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white border rounded-lg shadow-lg w-72">
                  <div className="p-1.5 space-y-0.5">
                    {SUGGESTED_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="p-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </Split>

      {markerPosition && (
        <TextMarker
          position={markerPosition}
          onClose={() => setMarkerPosition(null)}
          onColorSelect={handleColorSelect}
          onOpenSettings={() => setShowMarkerSettings(true)}
          colors={markerColors}
        />
      )}

      {showMarkerSettings && (
        <MarkerSettings
          colors={markerColors}
          onClose={() => setShowMarkerSettings(false)}
          onSave={setMarkerColors}
        />
      )}

      {showMarkedTexts && (
        <MarkedTextViewer
          markedTexts={markedTexts}
          onClose={() => {
            setShowMarkedTexts(false);
            setSelectedViewColor(undefined);
          }}
          selectedColor={selectedViewColor}
          onColorSelect={setSelectedViewColor}
          colors={markerColors}
        />
      )}
    </div>
  );
}

export default LessonView;