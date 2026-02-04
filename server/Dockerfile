FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

# Use --import to initialize dd-trace before any other code
CMD ["node", "--import", "dd-trace/initialize.mjs", "index.js"]
