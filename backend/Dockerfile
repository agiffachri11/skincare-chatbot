FROM node:18

WORKDIR /app

# Tidak perlu include "backend/"
COPY package*.json ./

RUN npm install

# Tidak perlu include "backend/"
COPY . .

EXPOSE 8080

CMD ["npm", "start"]