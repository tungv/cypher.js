FROM node:10


RUN ["mkdir", "-p",  "app"]
RUN ["pwd"]
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY binding.gyp binding.gyp
COPY prebuilds prebuilds
COPY submodules submodules
COPY src src
RUN ["npm", "install", "--unsafe-perm"]

# COPY prebuilds prebuilds

RUN ["node", "src/index"]
