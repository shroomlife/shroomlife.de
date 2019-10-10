FROM node:stretch
COPY . /app
WORKDIR /app
CMD ["npm", "start"]
