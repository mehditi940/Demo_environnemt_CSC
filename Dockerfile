FROM node:lts

WORKDIR /app

COPY . .

RUN npm install @rollup/rollup-linux-x64-gnu
RUN npm install --legacy-peer-deps

RUN npm run build

EXPOSE 3001
EXPOSE 5173
CMD ["npm", "run", "start"]