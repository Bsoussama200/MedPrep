import React from 'react';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  onFileSelect: (file: File) => void;
}

export function UploadButton({ onFileSelect }: UploadButtonProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-100 flex items-center gap-1">
      <Upload className="h-4 w-4" />
      Upload PDF
      <input
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}