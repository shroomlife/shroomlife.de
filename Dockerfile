FROM oven/bun:1 as base
LABEL maintainer="Robin Lehmann <robin@shroomlife.de>"
ENV TZ=Europe/Berlin
WORKDIR /usr/src/app

COPY . .

RUN bun install --production
RUN bun build.js

EXPOSE 80

CMD [ "bun", "start" ]
