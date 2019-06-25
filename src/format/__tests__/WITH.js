const { parse } = require('../../../index');
const print = require('../index');

describe('WITH', () => {
  test('simple WITH', () => {
    const query =
      /* cypher */`MATCH (u:USER { username: "test"}) WITH u CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 }) RETURN p  as product;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(
      /* cypher */`MATCH (u:USER { username: "test" })
WITH u
CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 })
RETURN p AS product;`
    );
  });

  test('WITH with AS', () => {
    const query =
      /* cypher */`MATCH (u:USER { username: "test"})
      WITH u,count(u) AS countU
      CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 }) RETURN p;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(
      /* cypher */`MATCH (u:USER { username: "test" })
WITH u, count(u) AS countU
CREATE (u)-[r:CREATED]->(p:PRODUCT { id: 1 })
RETURN p;`
    );
  })
});
