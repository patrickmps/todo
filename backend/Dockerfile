FROM node:20.14.0 AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g prisma

RUN prisma generate

CMD ["npm", "run", "dev"]