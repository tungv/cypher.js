FROM node:10

COPY vendors vendors
COPY prebuild.sh prebuild.sh
RUN ["sh", "prebuild.sh"]

COPY package-lock.json package-lock.json
COPY package.json package.json

COPY binding.gyp binding.gyp
COPY src src

RUN ["npm", "install"]
RUN npx prebuild -r napi

COPY index.js index.js
COPY tests tests

RUN npx jest

COPY .prebuildrc .prebuildrc

RUN npx prebuild -r napi

RUN rm .prebuildrc