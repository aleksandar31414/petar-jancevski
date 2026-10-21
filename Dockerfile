# 1) Изградба на React клиентот (Дел 4)
FROM node:20-alpine AS client
WORKDIR /client
COPY app_public/package.json ./
RUN npm install
COPY app_public/ ./
RUN npm run build

# 2) Express сервер (Дел 2 и 3)
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
COPY --from=client /client/dist ./app_public/dist
EXPOSE 3000
CMD ["node", "server.js"]
