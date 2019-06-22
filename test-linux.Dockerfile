FROM node:10
ARG CACHE_DATE=2016-01-01
RUN npm init --yes
COPY tests/linux.js index.js
RUN ["npm", "install", "native-cypher@1.0.0-beta.1", "--production"]

RUN node index.js