FROM node:stretch
LABEL maintainer="robin@shroomlife.de"

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --only=production

COPY . .

RUN cd mm/ && npm install
RUN cd mm/ && npm run-script build

EXPOSE 80

CMD ["node", "run-script", "start"]
