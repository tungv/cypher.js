FROM node:10
ARG uploadToken
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY prebuilds prebuilds
COPY prebuild.sh prebuild.sh
COPY binding.gyp binding.gyp
COPY src src
COPY vendors vendors

RUN ["npm", "install"]
RUN ["sh", "prebuild.sh"]
RUN npx prebuild -r napi --upload $uploadToken