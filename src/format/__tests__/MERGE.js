const { parse } = require('../../../index');
const print = require('../index');

describe('MERGE', () => {
  test('simple MERGE', () => {
    const query = /* cypher */ `MERGE (u:USER { username: "test"})-[r:CREATED]->(p:PRODUCT { id: 1 }) RETURN p;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(
      /* cypher */ `MERGE (u:USER { username: "test" })-[r:CREATED]->(p:PRODUCT { id: 1 })\nRETURN p;`,
    );
  });

  test('MERGE with pattern', () => {
    const query = /* cypher */ `
      MERGE (a:L1 {id: $id})<-[:R1 {k: 'v'}]-(b:L2)-[:R2 { k: 'v'}]->(c:L3 {k:'v'})
    `;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(
      /* cypher */ `MERGE (a:L1 { id: $id })<-[:R1 { k: "v" }]-(b:L2)-[:R2 { k: "v" }]->(c:L3 { k: "v" });`,
    );
  });

  test('MERGE with ON CREATE', () => {
    const query = /* cypher */ `
      MERGE (u:USER { username: "test"})-[r:CREATED]->(p:PRODUCT { id: 1 })
        ON CREATE SET p += $param_1, u += $param_2, p.key_1 = "value"
      RETURN p;`;
    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted)
      .toEqual(/* cypher */ `MERGE (u:USER { username: "test" })-[r:CREATED]->(p:PRODUCT { id: 1 })
ON CREATE SET p += $param_1, u += $param_2, p.key_1 = "value"
RETURN p;`);
  });

  test('MERGE with ON MATCH', () => {
    const query = /* cypher */ `MERGE (u:USER { username: "test"})-[r:CREATED]->(p:PRODUCT { id: 1 }) ON MATCH SET p += $param_1, u += $param_2, p.key_1 = "value" RETURN p;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted)
      .toEqual(/* cypher */ `MERGE (u:USER { username: "test" })-[r:CREATED]->(p:PRODUCT { id: 1 })
ON MATCH SET p += $param_1, u += $param_2, p.key_1 = "value"
RETURN p;`);
  });
});
