FROM mhart/alpine-node:5.1
MAINTAINER Joris Berthelot <admin@eexit.net>
WORKDIR /src
COPY . .
RUN npm install
EXPOSE 80
CMD [ "npm", "start" ]
