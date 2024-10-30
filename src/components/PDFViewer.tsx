import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadedPages, setLoadedPages] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPDF = async () => {
      if (!containerRef.current || !url) return;
      
      if (isMounted) {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        setLoadedPages(0);
        setTotalPages(0);
      }

      try {
        // Load the PDF directly using pdf.js
        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
          onProgress: (progress) => {
            if (isMounted && progress.total > 0) {
              const percentage = (progress.loaded / progress.total) * 100;
              setLoadingProgress(Math.round(percentage));
            }
          }
        });

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
          pageNumber.textContent = `Page ${pageNum} of ${pdf.numPages}`;
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
          setError('Failed to load PDF. Please try again.');
          setLoading(false);
        }
      }
    };

    if (url) {
      loadPDF();
    }

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600 bg-red-50 rounded-lg p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
        
        {/* Loading Progress */}
        <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Loading: {Math.round(loadingProgress)}%
        </div>

        {/* Page Progress */}
        {totalPages > 0 && (
          <div className="text-sm text-gray-600">
            Rendering pages: {loadedPages} of {totalPages}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-50">
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-auto pdf-container"
      />
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
    </div>
  );
};

export default PDFViewer;