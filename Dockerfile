FROM node:lts-stretch
LABEL maintainer="Robin Lehmann <robin@shroomlife.de>"
ENV TZ=Europe/Berlin

RUN corepack enable

WORKDIR /usr/src/app

COPY package*.json ./

RUN pnpm install --prod

COPY . .

EXPOSE 80

CMD ["pnpm", "run", "start"]
