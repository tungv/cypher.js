const print = require('../index');
const { parse } = require('../../../index');

it('should work with simplest query', () => {
  const query = 'MATCH (n) RETURN n;';

  const ast = parse(query);
  const formatted = print(ast.root);

  expect(formatted).toEqual(`MATCH (n)
RETURN n;`);
});
