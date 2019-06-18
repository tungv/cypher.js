FROM node:10

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY prebuilds prebuilds
COPY prebuild.sh prebuild.sh
COPY binding.gyp binding.gyp
COPY src src
COPY vendors vendors

RUN ["npm", "install", "--unsafe-perm", "--production"]

RUN ["node", "src"]