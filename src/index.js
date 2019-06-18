const path = require("path");
const parse = require("node-gyp-build")(path.resolve(__dirname, ".."));

const query = /* cypher */ `MATCH (r) RETURN r;`;

const r = parse(query);

console.log(query);
console.log(require("util").inspect(r, { depth: null, colors: true }));
