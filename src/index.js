const path = require("path");
const parse = require("node-gyp-build")(path.resolve(__dirname, ".."));

const r = parse(`
MATCH (n) RETURN n;
`);

console.log(require("util").inspect(r, { depth: null, colors: true }));
