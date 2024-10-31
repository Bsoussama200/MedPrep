import React, { useState, useRef, useEffect } from 'react';
import { X, Stethoscope, MessageCircle, Send } from 'lucide-react';
import { getPatientResponse, evaluateDiagnosis } from '../services/aiService';

interface MedicalCaseProps {
  title: string;
  initialCase: string;
  onClose: () => void;
}

const MedicalCase: React.FC<MedicalCaseProps> = ({ title, initialCase, onClose }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'patient' | 'system'; content: string }>>([
    { role: 'patient', content: initialCase }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showDiagnosisInput, setShowDiagnosisInput] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');

    try {
      const response = await getPatientResponse(inputMessage, title, initialCase);
      setMessages(prev => [...prev, { role: 'patient', content: response }]);
    } catch (error) {
      console.error('Error getting patient response:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Désolé, je ne peux pas répondre pour le moment.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await evaluateDiagnosis(diagnosis, title, initialCase);
      setDiagnosisResult(result);
      setShowDiagnosisInput(false);
    } catch (error) {
      console.error('Error evaluating diagnosis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Simulation de Cas Clinique</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-50 text-indigo-900 ml-12'
                  : msg.role === 'patient'
                  ? 'bg-gray-50 text-gray-900 mr-12'
                  : 'bg-red-50 text-red-900'
              }`}
            >
              {msg.role === 'user' && (
                <div className="text-sm text-indigo-600 mb-1">Médecin</div>
              )}
              {msg.role === 'patient' && (
                <div className="text-sm text-gray-600 mb-1">Patient</div>
              )}
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-pulse text-gray-400">En train de répondre...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Diagnosis Result - Now part of the scrollable area */}
        {diagnosisResult && (
          <div className="px-6 py-4 border-t overflow-y-auto max-h-[30vh]">
            <div className={`rounded-lg p-4 ${
              diagnosisResult.isCorrect ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <h3 className={`font-semibold ${
                diagnosisResult.isCorrect ? 'text-green-800' : 'text-red-800'
              } mb-2`}>
                {diagnosisResult.isCorrect ? 'Diagnostic Correct!' : 'Diagnostic à Revoir'}
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{diagnosisResult.explanation}</p>
            </div>
          </div>
        )}

        {/* Input Area - Only show if no diagnosis result */}
        {!diagnosisResult && (
          <div className="border-t p-6">
            {!showDiagnosisInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Posez une question au patient..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDiagnosisInput(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Proposer un diagnostic
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Entrez votre diagnostic détaillé..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDiagnosisInput(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleSubmitDiagnosis}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Soumettre le diagnostic
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalCase;