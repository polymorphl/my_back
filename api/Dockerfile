FROM node:7.6.0

# Fix timezone
RUN echo "Europe/Paris" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN mkdir /api

# TODO: Create a specific user before expose instance (See dockerfile in boilerplate_backend)

RUN npm install nodemon -g

WORKDIR /api

ADD .editorconfig .editorconfig
ADD package.json package.json
ADD nodemon.json nodemon.json
ADD index.js index.js
ADD config config
ADD ssl ssl
ADD src src

RUN npm install

EXPOSE 3000
