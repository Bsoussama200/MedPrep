import { UploadProgressCallback } from '../types/upload';

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function uploadPDF(
  file: File,
  lessonId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file) {
    throw new UploadError('No file selected');
  }

  if (!file.type.includes('pdf')) {
    throw new UploadError('Please select a valid PDF file');
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('File size exceeds 10MB limit');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('lessonId', lessonId.replace(/\D/g, ''));

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new UploadError(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.pdfUrl;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError('Upload failed: Network error');
  }
}