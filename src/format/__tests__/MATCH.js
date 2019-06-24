const { parse } = require('../../../index');
const print = require('../index');

describe('MATCH', () => {
  it('should work with simplest query', () => {
    const query = 'MATCH (n) RETURN n;';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (n)
RETURN n;`);
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
});
