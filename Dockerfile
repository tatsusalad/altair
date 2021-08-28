FROM node:alpine

# create directionary
RUN mkdir -p /usr/src/altair
WORKDIR /usr/src/altair

# install dependencies 
COPY package.json /usr/src/altair
RUN npm install

# copy bot to work dir
COPY . /usr/src/altair

# main command
CMD ["node", "index.js"]

LABEL author="tatsumara"
