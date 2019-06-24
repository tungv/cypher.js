const print = require('../index');
const { parse } = require('../../../index');

describe('variables', () => {
  it('variable in map', () => {
    const query = 'MATCH (n { key: $var.key }) RETURN n';

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(`MATCH (n { key: $var.key })
RETURN n;`);
  });
});
