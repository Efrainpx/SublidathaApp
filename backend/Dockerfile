# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
EXPOSE 3000

CMD ["node", "server.js"]
