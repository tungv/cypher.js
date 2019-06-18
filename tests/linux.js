const { parse } = require("native-cypher");

console.log(parse("MATCH (r) RETURN r"));
