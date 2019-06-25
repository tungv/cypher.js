const { parse } = require('../../../index');
const print = require('../index');

describe('UNWIND', () => {
  test('simple UNWIND', () => {
    const query =
      /* cypher */`MATCH (u:USER { username: "test"})
      WITH u, range(0, count(u) - 1) as index
      UNWIND index AS userIndex
      CREATE (p:PRODUCT)-[:CREATED_BY { index: userIndex }]->(u);`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(
      /* cypher */`MATCH (u:USER { username: "test" })
WITH u, range(0, count(u) - 1) AS index
UNWIND index AS userIndex
CREATE (p:PRODUCT)-[:CREATED_BY { index: userIndex }]->(u);`
    );
  });
});
