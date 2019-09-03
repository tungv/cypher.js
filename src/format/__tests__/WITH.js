const { parse } = require('../../../index');
const print = require('../index');

describe('WITH', () => {
  test('simple WITH', () => {
    const query = /* cypher */ `MATCH (u:USER { username: "test"}) WITH u CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 }) RETURN p  as product;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (u:USER { username: "test" })
WITH u
CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 })
RETURN p AS product;`);
  });

  test('WITH with AS', () => {
    const query = /* cypher */ `MATCH (u:USER { username: "test"})
      WITH u,count(u) AS countU
      CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 }) RETURN p;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (u:USER { username: "test" })
WITH u, count(u) AS countU
CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 })
RETURN p;`);
  });

  test('WITH with ORDER BY', () => {
    const query = /* cypher */ `MATCH (n:Node)
      WITH u ORDER BY u.age
      RETURN u.name;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (n:Node)
WITH u ORDER BY u.age
RETURN u.name;`);
  });

  test('WITH with LIMIT OFFSET', () => {
    const query = /* cypher */ `MATCH (n:Node)
      WITH u ORDER BY u.age  SKIP 20 LIMIT 10
      RETURN u.name;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (n:Node)
WITH u ORDER BY u.age SKIP 20 LIMIT 10
RETURN u.name;`);
  });
});
