FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
# migrate est rejouable, seed:if-empty ne touche pas aux données existantes
CMD ["sh", "-c", "npm run migrate && npm run seed:if-empty && npm start"]
