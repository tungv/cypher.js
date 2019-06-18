FROM node:10

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY prebuilds prebuilds
COPY prebuild.sh prebuild.sh
COPY binding.gyp binding.gyp
COPY vendors vendors
COPY src src

RUN ["npm", "install", "--unsafe-perm", "--production"]

RUN ["node", "src"]