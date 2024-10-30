import React from 'react';
import { Loader2, X } from 'lucide-react';

interface UploadProgressPopupProps {
  progress: number;
  onClose: () => void;
  error?: string | null;
}

export function UploadProgressPopup({ progress, onClose, error }: UploadProgressPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center">
          {error ? (
            <>
              <div className="text-red-600 mb-4">
                <X className="h-8 w-8" />
              </div>
              <div className="text-red-600 text-center">
                {error}
              </div>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                Uploading PDF: {progress}%
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}