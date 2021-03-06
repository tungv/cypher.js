const { parse } = require('../../../index');
const print = require('../index');

describe('MATCH', () => {
  it('should work with simplest query', () => {
    const query = /* cypher */ `MATCH (n) RETURN n`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (n)
RETURN n;`);
  });

  it('should work with alias', () => {
    const query = 'MATCH (n) RETURN n as m;';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (n)
RETURN n AS m;`);
  });

  it('should work with multiple returns', () => {
    const query = 'MATCH (a)--(b) RETURN a AS x, b AS y;';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (a)--(b)
RETURN a AS x, b AS y;`);
  });

  it('should work with WHERE', () => {
    const query =
      'MATCH (n) WHERE n.key_1 = "string" AND 1 = n.key_2 RETURN n;';
    const ast = parse(query);
    const formatted = print(ast.root);
    expect(formatted).toEqual(`MATCH (n)
WHERE n.key_1 = "string" AND 1 = n.key_2
RETURN n;`);
  });

  it('should work with transform', () => {
    const query = /* cypher */ `MATCH (n) RETURN n;`;

    const ast = parse(query);

    function transform(walk) {
      let isMatching = false;
      walk({
        match() {
          isMatching = true;
          return () => {
            isMatching = false;
          };
        },
        'node-pattern'(node) {
          if (isMatching) {
            node.properties = node.properties || { type: 'map', entries: {} };

            node.properties.entries.additional = {
              type: 'integer',
              value: 1,
            };
          }
        },
      });
    }

    const formatted = print(ast.root, transform);

    expect(formatted).toEqual(`MATCH (n { additional: 1 })\nRETURN n;`);
  });

  it('should work with SET', () => {
    const query = /* cypher */ `
    MATCH (a)<--(b)
    SET a.x = b.y
  `;

    const ast = parse(query);
    const formatted = print(ast.root);
    expect(formatted).toEqual(/* cypher */ `MATCH (a)<--(b)
SET a.x = b.y;`);
  });

  it('should work with plucking properties', () => {
    const query = /* cypher */ `
    MATCH (n) RETURN n { .a , .b , .c } as plucked; 
    `;

    const ast = parse(query);
    const formatted = print(ast.root);
    expect(formatted).toEqual(/* cypher */ `MATCH (n)
RETURN n { .a, .b, .c } AS plucked;`);
  });
});
