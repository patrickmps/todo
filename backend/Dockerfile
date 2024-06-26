FROM node:20.14.0 AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g prisma

RUN prisma generate

RUN npm run build

RUN npm install -g pm2 && npm install

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
# CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]