FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads/pitchdecks uploads/projects uploads/kyc uploads/avatars uploads/misc
EXPOSE 5000
CMD ["npm", "run", "dev"]
