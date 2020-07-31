FROM node:stretch
LABEL maintainer="robin@shroomlife.de"

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --only=production

COPY . .

EXPOSE 80

CMD ["npm", "run-script", "start"]
