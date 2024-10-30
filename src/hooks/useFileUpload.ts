import { useState, useCallback } from 'react';
import { uploadPDF } from '../services/uploadService';
import { UploadState } from '../types/upload';
import { useStore } from '../store';

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: null,
    error: null,
  });
  const { uploadPdf } = useStore();

  const handleUpload = useCallback(async (file: File, lessonId: string) => {
    try {
      setUploadState({ progress: 0, error: null });

      const pdfUrl = await uploadPDF(file, lessonId);
      await uploadPdf(lessonId, pdfUrl);

      setUploadState({ progress: 100, error: null });
      setTimeout(() => {
        setUploadState({ progress: null, error: null });
      }, 1000);
    } catch (error) {
      setUploadState({
        progress: null,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }, [uploadPdf]);

  const resetUploadState = useCallback(() => {
    setUploadState({ progress: null, error: null });
  }, []);

  return {
    uploadState,
    handleUpload,
    resetUploadState,
  };
}