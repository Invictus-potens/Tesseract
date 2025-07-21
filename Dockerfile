FROM node:18

# Install Tesseract and Portuguese language data
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-por

WORKDIR /app
COPY . .

RUN npm install

CMD ["npm", "start"] 