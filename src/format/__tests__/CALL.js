const { parse } = require('../../../index');
const print = require('../index');

describe('CALL statement', () => {
  test.skip('simple CALL YIELD WHERE', () => {
    const query = /* cypher */ `
    CALL sum(1, 2, 3) YIELD value WHERE value.p = 1 RETURN value
    `;

    const ast = parse(query);
    const formatted = print(ast);

    expect(formatted).toEqual(/* cypher */ `CALL sum(1, 2, 3)
YIELD value WHERE value.p = 1
RETURN value;`);
  });

  test('CALL statement should work', () => {
    const query = /* cypher */ `
    CALL db.index.fulltext.queryNodes("fullTextIdx", $query +"*")
    YIELD node MATCH (node)
    WHERE any(lbs IN labels(node) WHERE lbs IN $nodeTypes)
    WITH node
    MATCH (origin:Node {id: $origin})
    WHERE (origin)-[*1..2]-(node) AND origin <> node
    RETURN DISTINCT labels(node) as labels, id(node) as id SKIP $skip LIMIT $limit    
    `;

    const ast = parse(query);
    const formatted = print(ast);

    expect(formatted)
      .toEqual(/* cypher */ `CALL db.index.fulltext.queryNodes("fullTextIdx", $query + "*")
YIELD node
MATCH (node)
WHERE any(lbs IN labels(node) WHERE lbs IN $nodeTypes)
WITH node
MATCH (origin:Node { id: $origin })
WHERE (origin)-[*1..2]-(node) AND origin <> node
RETURN DISTINCT labels(node) AS labels, id(node) AS id SKIP $skip LIMIT $limit;`);
  });
});
