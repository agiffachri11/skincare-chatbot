# backend/Dockerfile
FROM node:18

WORKDIR /app

# Copy package.json dari folder backend
COPY backend/package*.json ./

RUN npm install

# Copy seluruh konten folder backend
COPY backend/ .

EXPOSE 8080

CMD ["npm", "start"]