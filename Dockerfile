FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install --frozen-lockfile
COPY src ./src
RUN npm run build

CMD ["sh", "-c", "node ./dist/bot.js run --user-id ${USER_ID} --api-url ${API_URL} --token ${TOKEN}"]