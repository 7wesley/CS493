FROM node:14

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm ci

COPY . .

EXPOSE 5000

#Commands run when container is run

CMD ["node", "app.js"]