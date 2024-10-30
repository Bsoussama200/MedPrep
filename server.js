import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import { mkdir } from 'fs/promises';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Ensure the PDFs directory exists
const pdfDir = join(__dirname, 'public', 'pdfs');
await mkdir(pdfDir, { recursive: true });

// Configure multer for PDF storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pdfDir);
  },
  filename: function (req, file, cb) {
    const lessonId = req.body.lessonId;
    cb(null, `${lessonId}.pdf`);
  }
});

const upload = multer({ storage: storage });

// Serve static files
app.use('/pdfs', express.static(join(__dirname, 'public', 'pdfs')));
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle PDF uploads
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.body.lessonId) {
      return res.status(400).json({ error: 'Missing file or lesson ID' });
    }

    const pdfUrl = `/pdfs/${req.body.lessonId}.pdf`;
    res.json({ pdfUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});