const { parse } = require('../../../index');
const print = require('../index');

describe('CREATE', () => {
  it('MATCH and CREATE', () => {
    const query = /* cypher */ `
      MATCH (n) CREATE (p:LABEL { key_1: 'string', key_2: 1, key_3: false }) RETURN p;
    `;

    const ast = parse(query);
    const formatted = print(ast.root);
    expect(formatted).toEqual(/* cypher */ `MATCH (n)
CREATE (p:LABEL {
  key_1: "string",
  key_2: 1,
  key_3: false
})
RETURN p;`);
  });

  it('MATCH and CREATE UNIQUE', () => {
    const query = /* cypher */ `
    MATCH (n) CREATE UNIQUE (p:LABEL { key_1: 'string', key_2: 1 }) RETURN p;
    `;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (n)
CREATE UNIQUE (p:LABEL {
  key_1: "string",
  key_2: 1
})
RETURN p;`);
  });

  it('CREATE with SET', () => {
    const query = /* cypher */ `
    MATCH (n) CREATE (p:LABEL { key_1: 'string', key_2: 1, key_3: false })
    SET n += { key_4: 1.23 }
    RETURN p;
  `;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (n)
CREATE (p:LABEL {
  key_1: "string",
  key_2: 1,
  key_3: false
})
SET n += { key_4: 1.23 }
RETURN p;`);
  });
});
