# cypher.js

Utilities to parse, transform and format cypher query. Inspired by [node-cypher-parser](https://github.com/Loupi/node-cypher-parser) with 3 main differences:

1. this package can handle long query (longer than 1024 characters)
2. this package doesn't rename `node.type` from `libcypher-parser`
3. this package will eventually include a `format` utility to print an AST back to a string.

# APIs

## 1. `parse(query)`

Accepts a cypher query string and try to parse it to Abstract Syntax Tree using native [libcypher-parser](https://github.com/cleishm/libcypher-parser).

Example:

```js
const { parse } = require('cypher.js');

const result = parse("MATCH (n) RETURN n");

> console.log(require('util').inspect(result, { depth: null }))
/*
{ nnodes: 10,
  eof: false,
  errors: [],
  root:
   { type: 'statement',
     body:
      { type: 'query',
        clauses:
         [ { type: 'match',
             optional: false,
             pattern:
              { type: 'pattern',
                paths:
                 [ { type: 'pattern-path',
                     elements:
                      [ { type: 'node-pattern',
                          identifier: { type: 'identifier', name: 'n' },
                          labels: [] } ] } ] },
             hints: [] },
           { type: 'return',
             distinct: false,
             includeExisting: false,
             projections:
              [ { type: 'projection',
                  expression: { type: 'identifier', name: 'n' } } ] } ],
        options: [] },
     options: [] } }
*/
```

## 2. `format(root, transform)`

_**Stability: experimental**_

Accepts a AST root and and optional transform function and returns a reformatted string.

Example:

```js
const { parse, UNSTABLE__format } = require('cypher.js');

const result = parse('MATCH (n) RETURN n');

const reformatted = UNSTABLE__format(result.root);

// reformatted = "MATCH (n)\nRTURN n;"
```
