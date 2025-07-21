FROM node:18

# Install Tesseract
RUN apt-get update && apt-get install -y tesseract-ocr

WORKDIR /app
COPY . .

RUN npm install

CMD ["npm", "start"] 