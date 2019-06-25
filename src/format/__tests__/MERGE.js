const { parse } = require('../../../index');
const print = require('../index');

describe('MERGE', () => {
  test('simple MERGE', () => {
    const query = 'MERGE (u:USER { username: "test"})-[r:CREATED]->(p:PRODUCT { id: 1 }) RETURN p;';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MERGE (u:USER { username: "test" })-[r:CREATED]->(p:PRODUCT { id: 1 })\nRETURN p;`);
  });

  test('MERGE with ON CREATE', () => {
    const query = 'MERGE (u:USER { username: "test"})-[r:CREATED]->(p:PRODUCT { id: 1 }) ON CREATE SET p.key = $param.key RETURN p;';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MERGE (u:USER { username: "test" })-[r:CREATED]->(p:PRODUCT { id: 1 })
ON CREATE SET p.key = $param.key
RETURN p;`);
  });

  test('MERGE with ON MATCH', () => {
    const query = 'MERGE (u:USER { username: "test"})-[r:CREATED]->(p:PRODUCT { id: 1 }) ON MATCH SET p.key = $param.key RETURN p;';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MERGE (u:USER { username: "test" })-[r:CREATED]->(p:PRODUCT { id: 1 })
ON MATCH SET p.key = $param.key
RETURN p;`);
  });
})