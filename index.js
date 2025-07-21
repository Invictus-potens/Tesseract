const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

app.post('/ocr', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('[IMAGE] No file received in OCR request.');
    return res.status(400).send('No file uploaded');
  }
  console.log(`[IMAGE] Received file for OCR: ${req.file.originalname || req.file.filename}, saved as ${req.file.path}`);
  const filePath = req.file.path;
  const outPath = filePath + '-out';
  console.log(`[OCR] Starting Tesseract for file: ${filePath}`);
  exec(`tesseract ${filePath} ${outPath} -l por`, (err) => {
    if (err) {
      console.error(`[OCR] Tesseract failed for file: ${filePath}`, err);
      fs.unlinkSync(filePath);
      return res.status(500).send('OCR failed');
    }
    console.log(`[OCR] Tesseract completed for file: ${filePath}`);
    fs.readFile(outPath + '.txt', 'utf8', (err, data) => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outPath + '.txt');
      if (err) {
        console.error(`[OCR] Failed to read OCR output for file: ${filePath}`, err);
        return res.status(500).send('Read failed');
      }
      console.log(`[OCR] Successfully read OCR output for file: ${filePath}`);
      res.json({ text: data });
    });
  });
});

app.get('/', (req, res) => {
  res.send('Tesseract OCR microservice is running.');
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('[SERVER] Unhandled error:', err);
  res.status(500).send('Internal server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OCR service running on port ${PORT}`)); 