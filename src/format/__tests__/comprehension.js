const { parse } = require('../../../index');
const print = require('../index');

describe('list comprenhension', () => {
  it('should work with MATCH query', () => {
    const query = /* cypher */ `
    MATCH (n)
    RETURN n { a: [(n)<-[:someRel]-(b) | b.key]};
    `;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (n)
RETURN n { a: [(n)<-[:someRel]-(b) | b.key] };`);
  });

  it('should work with WHERE in subquery', () => {
    const query = /* cypher */ `
    MATCH (n)
    RETURN n { a: [(n)<-[:someRel]-(b) WHERE b.x IS NOT NULL | b.key]};
    `;

    const ast = parse(query);
    const formatted = print(ast.root);

    expect(formatted).toEqual(/* cypher */ `MATCH (n)
RETURN n { a: [(n)<-[:someRel]-(b) WHERE b.x IS NOT NULL | b.key] };`);
  });
});
