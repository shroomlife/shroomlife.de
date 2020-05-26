FROM node:stretch
LABEL maintainer="robin@shroomlife.de"

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

CMD ["node", "index"]
