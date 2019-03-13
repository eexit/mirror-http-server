FROM mhart/alpine-node
RUN apk add --no-cache make gcc g++ python
WORKDIR /app
COPY . .
RUN npm install --loglevel=error --prod
EXPOSE 80
CMD [ "npm", "start" ]
