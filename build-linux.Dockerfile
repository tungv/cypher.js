FROM node:10

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY prebuilds prebuilds
COPY prebuild.sh prebuild.sh
COPY binding.gyp binding.gyp
COPY src src
COPY vendors vendors

RUN ["npm", "install"]
RUN ["npm", "run", "build"]

RUN ["sh", "prebuild.sh"]
RUN ["npx", "prebuild","-r","napi","--upload","b48b940f5d93ebfe47076d52c59187cda0e5a07d"]