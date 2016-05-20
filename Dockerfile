FROM node:argon

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json .
RUN npm install

# Bundle app source
COPY index.js .
COPY lib lib
COPY config config
COPY etc etc

RUN ls -la /app

EXPOSE 3000
CMD [ "npm", "start" ]

