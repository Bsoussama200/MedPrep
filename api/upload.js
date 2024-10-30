import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer();

// Ensure the PDFs directory exists
const pdfDir = join(process.cwd(), 'public', 'pdfs');
await mkdir(pdfDir, { recursive: true });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const lessonId = req.body.lessonId;

    if (!file || !lessonId) {
      return res.status(400).json({ error: 'Missing file or lesson ID' });
    }

    // Create filename using lesson number
    const filename = `lesson-${lessonId}.pdf`;
    const filepath = join(pdfDir, filename);

    // Save the file
    await writeFile(filepath, file.buffer);

    // Return the URL for the saved PDF
    const pdfUrl = `/pdfs/${filename}`;
    res.json({ pdfUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;