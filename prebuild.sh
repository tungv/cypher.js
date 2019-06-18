echo "[1/5] extracting…"
tar zxvpf vendors/libcypher-parser-0.6.2.tar.gz >> build.log 2>&1
cd libcypher-parser-0.6.2

echo "[2/5] configuring…"
./configure --prefix=/usr/local CFLAGS='-fPIC' >> build.log 2>&1
make clean check  >> build.log 2>&1

echo "[3/5] installing…"
make -k install >> build.log 2>&1

echo "[4/5] cleaning up…"

cd ..
rm -rf libcypher-parser-0.6.2
echo "[5/5] libcypher built ok!"