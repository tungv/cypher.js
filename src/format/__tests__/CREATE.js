const print = require('../index');
const { parse } = require('../../../index');

describe('CREATE', () => {
  it('MATCH and CREATE', () => {
    const query =
      "MATCH (n) CREATE (p:LABEL { key_1: 'string', key_2: 1 }) RETURN p;";

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (n)
CREATE (p:LABEL {
  key_1: "string",
  key_2: 1
})
RETURN p;`);
  });

  it('MATCH and CREATE UNIQUE', () => {
    const query =
      "MATCH (n) CREATE UNIQUE (p:LABEL { key_1: 'string', key_2: 1 }) RETURN p;";

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (n)
CREATE UNIQUE (p:LABEL {
  key_1: "string",
  key_2: 1
})
RETURN p;`);
  });
});
