FROM node:lts-stretch
LABEL maintainer="Robin Lehmann <robin@shroomlife.de>"
ENV TZ=Europe/Berlin

RUN corepack enable

WORKDIR /usr/src/app

COPY . .

RUN pnpm install --prod
RUN pnpm run build

EXPOSE 80

CMD ["pnpm", "run", "start"]
