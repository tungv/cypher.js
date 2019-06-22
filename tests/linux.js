const { parse } = require("native-cypher");

console.log(parse("MATCH (r) RETURN r"));

const query = /* cypher */ `
  MATCH (n)

  CREATE (a1:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b1:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a2:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b2:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a3:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b3:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a4:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b4:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a5:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b5:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a6:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b6:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a7:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b7:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a8:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b8:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a9:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b9:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a10:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b10:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a11:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b11:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a12:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b12:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a13:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b13:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a14:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b14:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a15:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b15:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a16:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b16:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a17:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b17:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a18:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b18:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a19:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b19:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a20:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b20:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a21:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b21:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a22:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b22:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a23:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b23:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a24:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b24:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a25:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b25:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a26:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b26:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a27:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b27:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a28:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b28:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a29:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b29:LONGER_LABEL { long_key: 'long_value'})
  CREATE (a30:LONG_LABEL)-[:LONG_RELATIONSHIP_NAME]->(b30:LONGER_LABEL { long_key: 'long_value'})

  RETURN n;
  `;

console.log(parse(query).errors);
