FROM node:12.18.2-stretch-slim

RUN npm install -g nodemon
RUN mkdir -p /app/development

WORKDIR /app/development
COPY . .
RUN npm install 

CMD ["npm", "run", "dev"]