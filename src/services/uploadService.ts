export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

interface UploadResponse {
  pdfUrl: string;
  error?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
}

type ProgressCallback = (progress: UploadProgress) => void;

export async function uploadPDF(
  file: File, 
  lessonId: string, 
  onProgress?: ProgressCallback
): Promise<UploadResponse> {
  // Validate file
  if (!file) {
    throw new UploadError('No file selected');
  }

  // Validate file type
  if (!file.type.includes('pdf')) {
    throw new UploadError('Please select a valid PDF file');
  }

  // Validate file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('File size exceeds 10MB limit');
  }

  const formData = new FormData();
  formData.append('file', file);
  const lessonNumber = lessonId.replace(/\D/g, '');
  formData.append('lessonId', lessonNumber);

  try {
    const xhr = new XMLHttpRequest();
    
    // Create promise to handle XHR
    const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.error) {
              reject(new UploadError(response.error));
            } else {
              resolve(response);
            }
          } catch (e) {
            reject(new UploadError('Invalid server response'));
          }
        } else {
          reject(new UploadError(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new UploadError('Network error occurred'));
      };

      xhr.onabort = () => {
        reject(new UploadError('Upload cancelled'));
      };
    });

    // Start upload
    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);

    return await uploadPromise;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError('Upload failed: Unknown error occurred');
  }
}