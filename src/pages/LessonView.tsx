import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Play, PauseCircle, Book, Upload } from 'lucide-react';
import Split from 'react-split';
import { useStore } from '../store';
import PDFViewer from '../components/PDFViewer';
import { UploadProgressPopup } from '../components/UploadProgressPopup';
import { uploadPDF } from '../services/uploadService';

function LessonView() {
  const { id } = useParams();
  const { lessons, uploadPdf } = useStore();
  const lesson = lessons.find(l => l.id === id);
  const [selectedText, setSelectedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  const [quizQuestions, setQuizQuestions] = useState<number>(10);
  const [showQuiz, setShowQuiz] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  }, []);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: 'This is a simulated AI response. In a production environment, this would be connected to Gemini API.'
      }]);
    }, 1000);
    setMessage('');
  }, [message]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploadProgress(0);
      setUploadError(null);

      const response = await uploadPDF(file, id, (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        setUploadProgress(percentage);
      });

      if (response.pdfUrl) {
        await uploadPdf(id, file);
        setUploadProgress(100);

        setTimeout(() => {
          setUploadProgress(null);
          setUploadError(null);
        }, 1000);
      } else {
        throw new Error('No PDF URL received from server');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload PDF');
      setUploadProgress(null);
    }
  }, [id, uploadPdf]);

  const startQuiz = useCallback(() => {
    setShowQuiz(true);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Split 
        sizes={[66, 34]} 
        minSize={[400, 300]}
        gutterSize={8}
        className="flex h-full"
        gutter={() => {
          const gutter = document.createElement('div');
          gutter.className = 'gutter-horizontal';
          return gutter;
        }}
      >
        <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Book className="mr-2" />
              {lesson?.title}
            </h2>
            <div className="flex items-center gap-2">
              {!lesson?.pdfUrl && (
                <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-100 flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Upload PDF
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-indigo-600 hover:text-indigo-700"
              >
                {isPlaying ? <PauseCircle className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-hidden"
            onMouseUp={handleTextSelection}
          >
            {lesson?.pdfUrl ? (
              <PDFViewer url={lesson.pdfUrl} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Upload a PDF to start studying</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Questions
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={quizQuestions}
                onChange={(e) => setQuizQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={startQuiz}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Start Quiz
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about the lesson..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Send
            </button>
          </form>
        </div>
      </Split>

      {(uploadProgress !== null || uploadError) && (
        <UploadProgressPopup 
          progress={uploadProgress ?? 0}
          error={uploadError}
          onClose={() => {
            setUploadProgress(null);
            setUploadError(null);
          }}
        />
      )}
    </div>
  );
}

export default LessonView;