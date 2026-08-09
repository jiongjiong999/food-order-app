FROM node:18-slim

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install --production

# Copy application files
COPY server.js .
COPY web/ ./web/

# Hugging Face Spaces uses port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]
