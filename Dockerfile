FROM node:12-alpine

RUN apk update && \
    apk add --update python make g++ ca-certificates && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 80 443

CMD [ "node", "src/index.js" ]
