FROM node:16-alpine
RUN apk add --no-cache yarn
WORKDIR /app
COPY functions .
RUN yarn --frozen-lockfile --loglevel=error --prod
EXPOSE 8080
CMD [ "yarn", "start" ]
