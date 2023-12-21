
FROM node:17
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
ENV PORT 8080
ENV HOST 0.0.0.0
CMD [ "npm", "start"]