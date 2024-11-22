FROM node:20
WORKDIR /usr/app
COPY package.json .
RUN npm install
COPY ./ /usr/app
EXPOSE 3000
CMD [ "node", "server.js"]
