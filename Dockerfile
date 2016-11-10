FROM node:argon

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json .
RUN npm install && echo "updated 2016 nov 9."

# Bundle app source
COPY index.js .
COPY lib lib
COPY config config
#COPY etc etc

EXPOSE 3000
CMD [ "npm", "start" ]
