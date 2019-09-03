const { parse } = require('../../../index');
const print = require('../index');

describe('operators', () => {
  test('simple binary', () => {
    const query = /* cypher */ `MATCH (n)
RETURN n.a + n.b;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('different priority binary', () => {
    const query = /* cypher */ `MATCH (n)
RETURN n.a + n.b * 3;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('different priority binary with parens', () => {
    const query = /* cypher */ `MATCH (n)
RETURN (n.a + n.b) * 3;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('different priority binary with multiple pairs of parens', () => {
    const query = /* cypher */ `MATCH (n)
RETURN (n.a + n.b) / (3 + n.x);`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('simple logical op', () => {
    const query = /* cypher */ `MATCH (n)
RETURN n.x AND n.y;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('simple postfix unary', () => {
    const query = /* cypher */ `MATCH (n)
RETURN n.x AND n.y IS NOT NULL;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('simple prefix unary', () => {
    const query = /* cypher */ `MATCH (n)
RETURN -n.x;`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('simple subscript operator', () => {
    const query = /* cypher */ `MATCH (n)
RETURN -n[1];`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });

  test('complex subscript operator', () => {
    const query = /* cypher */ `MATCH (n)
RETURN -n[n.a ^ 2 * (n.x + n.y)];`;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(query);
  });
});
