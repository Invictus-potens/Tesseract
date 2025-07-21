const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/ocr', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const outPath = filePath + '-out';
  exec(`tesseract ${filePath} ${outPath} -l por`, (err) => {
    if (err) {
      fs.unlinkSync(filePath);
      return res.status(500).send('OCR failed');
    }
    fs.readFile(outPath + '.txt', 'utf8', (err, data) => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outPath + '.txt');
      if (err) return res.status(500).send('Read failed');
      res.json({ text: data });
    });
  });
});

app.get('/', (req, res) => {
  res.send('Tesseract OCR microservice is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OCR service running on port ${PORT}`)); 