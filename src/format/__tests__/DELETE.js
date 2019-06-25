const { parse } = require('../../../index');
const print = require('../index');

describe('DELETE', () => {
  test('simple DELETE', () => {
    const query = /* cypher */ `MATCH (u:USER { username: "test" })
      DELETE u;`;

    const ast = parse(query);
    const formatted = print(ast.root);
    expect(formatted).toEqual(/* cypher */ `MATCH (u:USER { username: "test" })
DELETE u;`);
  });

  test('DETACH DELETE', () => {
    const query = /* cypher */ `MATCH (u:USER { username: "test" })
      DETACH DELETE u;`;

    const ast = parse(query);
    const formatted = print(ast.root);
    expect(formatted).toEqual(/* cypher */ `MATCH (u:USER { username: "test" })
DETACH DELETE u;`);
  });
});
