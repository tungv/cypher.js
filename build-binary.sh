# build darwin
npx prebuild -r napi

# build linux
cp ~/.prebuildrc .
docker build . -f build-linux.Dockerfile -t cypher-build-linux
rm .prebuildrc