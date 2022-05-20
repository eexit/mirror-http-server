FROM node:lts-alpine
RUN apk add --no-cache yarn
WORKDIR /app
COPY . .
RUN yarn --frozen-lockfile --loglevel=error --prod
EXPOSE 8080
CMD [ "yarn", "start" ]
