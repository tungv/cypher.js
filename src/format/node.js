/* eslint-disable */
const { walk } = require('estree-walker');

const { getPriority, toCypherSymbol } = require('./binary-operator');
const listOps = require('./list-ops');

function walkProjections(buffer, node) {
  if (node.distinct) {
    buffer.push('DISTINCT ');
  }

  if (node.includeExisting) {
    buffer.push('* ');
  }
}

const onEnter = {
  match(buffer, node) {
    buffer.push('\n');
    if (node.optional) {
      buffer.push('OPTIONAL ');
    }

    buffer.push('MATCH ');
  },

  merge(buffer) {
    buffer.push('\nMERGE ');
  },

  'on-create'(buffer, node) {
    buffer.push('\nON CREATE SET ');

    buffer.push(
      node.items
        .map(item => {
          const exp = [];
          if (item.type === 'set-property') {
            // walkExpression(exp, item.property);
            exp.push(' = ');
            // walkExpression(exp, item.expression);
          }

          if (item.type === 'merge-properties') {
            exp.push(item.identifier.name, ' += ');
            // walkExpression(exp, item.expression);
          }

          return exp.join('');
        })
        .join(', '),
    );

    // this.skip();
  },
  'on-match'(buffer, node) {
    buffer.push('\nON MATCH SET ');

    buffer.push(
      node.items
        .map(item => {
          const exp = [];
          if (item.type === 'set-property') {
            // walkExpression(exp, item.property);
            exp.push(' = ');
            // walkExpression(exp, item.expression);
          }

          if (item.type === 'merge-properties') {
            exp.push(item.identifier.name, ' += ');
            // walkExpression(exp, item.expression);
          }

          return exp.join('');
        })
        .join(', '),
    );

    this.skip();
  },
  unwind(buffer, node) {
    buffer.push('\nUNWIND ');

    const exp = [];
    // walkExpression(exp, node.expression);
    buffer.push(exp.join(''));
    buffer.push(' AS ', node.alias.name, '\n');
  },
  with(buffer, node) {
    buffer.push('\nWITH ');
    walkProjections(buffer, node);
  },

  delete(buffer, node) {
    if (node.detach) {
      buffer.push('DETACH ');
    }

    buffer.push('DELETE ');

    buffer.push(
      ...node.expressions
        .map(expNode => {
          const exp = [];
          // walkExpression(exp, expNode);
          return exp.join('');
        })
        .join(', '),
    );
  },

  'set-property'(buffer, node) {
    const prop = ['SET '];
    // walkExpression(prop, node.property);
    prop.push(' = ');
    // walkExpression(prop, node.expression);

    buffer.push(prop.join(''));
  },

  'node-pattern'(buffer, node) {
    buffer.push('(');
  },
  label(buffer, node) {
    return `:${node.name}`;
  },
  'rel-pattern'(buffer, node) {
    if (node.direction === 0) {
      buffer.push('<-');
    }
    if (node.direction === 1) {
      buffer.push('-');
    }
    if (node.direction === 2) {
      buffer.push('-');
    }

    const emptyRel = node.reltypes.length === 0 && node.identifier == null;

    if (!emptyRel) buffer.push('[');

    if (node.identifier) {
      buffer.push(node.identifier.name);
    }

    if (node.reltypes) {
      buffer.push(...node.reltypes.map(l => `:${l.name}`));
    }

    if (node.properties) {
      buffer.push(' ');
      // walkExpression(buffer, node.properties);
    }

    if (!emptyRel) buffer.push(']');

    if (node.direction === 0) {
      buffer.push('-');
    }
    if (node.direction === 1) {
      buffer.push('->');
    }
    if (node.direction === 2) {
      buffer.push('-');
    }

    this.skip();
  },
  'pattern-comprehension'(buffer) {
    buffer.push(' [');
  },
  return(buffer, node) {
    buffer.push('\nRETURN ');
    walkProjections(buffer, node);
  },
  projection(buffer, node) {},
  'map-projection'(buffer, node) {
    buffer.push(node.expression.name);
  },
  'map-projection-literal'(buffer, node, parent, key, index) {
    if (index === 0) {
      buffer.push(' { ');
    }

    buffer.push(node.propName.value, ':');
  },
  map(buffer, node) {
    buffer.push(' { ');
    const map = [];
    for (const entry in node.entries) {
      const exp = [entry, ': ', ...walkNode(node.entries[entry])];

      map.push(exp.join(''));
    }
    return map.join(', ');
    buffer.push('} ');
    this.skip();
  },
  create(buffer, node) {
    buffer.push('\nCREATE ');

    if (node.unique) {
      buffer.push('UNIQUE ');
    }
  },
  set(buffer, node) {
    buffer.push('\nSET ');
    // console.log(require('util').inspect(node, { depth: null, colors: true }));
    // buffer.push(
    //   node.items
    //     .map(item => {
    //       const exp = [];
    //       if (item.type === 'set-property') {
    //         // walkExpression(exp, item.property);
    //         exp.push(' = ');
    //         // walkExpression(exp, item.expression);
    //       }

    //       if (item.type === 'merge-properties') {
    //         exp.push(item.identifier.name, ' += ');
    //         // walkExpression(exp, item.expression);
    //       }

    //       return exp.join('');
    //     })
    //     .join(', '),
    // );
    // this.skip();
  },
  'binary-operator'(buffer, node, parent) {
    const priority = getPriority(node);

    const parentPriority = getPriority(parent);

    if (priority > parentPriority) {
      buffer.push('(');
    }

    const arg1 = walkNode(node.arg1);
    const arg2 = walkNode(node.arg2);
    buffer.push([...arg1, toCypherSymbol(node.op), ...arg2].join(' '));
    this.skip();
  },
  'apply-operator'(buffer, node) {
    buffer.push(node.funcName.value);
    buffer.push('(');
  },
  string(buffer, node) {
    buffer.push(JSON.stringify(node.value));
  },
  integer(buffer, node) {
    buffer.push(JSON.stringify(node.value));
  },
  false() {
    return 'false';
  },
  true() {
    return 'true';
  },
  float(buffer, node) {
    buffer.push(JSON.stringify(node.value));
  },
};

const onLeave = {
  statement() {
    return ';';
  },
  match(buffer, node) {
    if (node.predicate) {
      buffer.push('\nWHERE ');
      // walkExpression(buffer, node.predicate);
    }

    buffer.push('\n');
  },
  map(buffer) {
    buffer.push(' }');
  },
  projection(buffer, node, parent, key, index) {
    if (node.alias) {
      // workaround for a parsing bug in libcypher
      if (node.alias.name.includes(' ')) {
        return;
      }
      buffer.push(' AS ', node.alias.name);
    }

    if (parent[key].length !== index + 1) {
      return ', ';
    }
  },
  'map-projection-literal'(buffer, node, parent, key, index) {
    if (index + 1 === parent[key].length) {
      return '}';
    }
  },
  'pattern-comprehension'(buffer, node) {
    buffer.push(' | ');
    // walkExpression(buffer, node.eval);
    buffer.push('] ');
  },
  with() {
    return '\n';
  },
  parameter(buffer, node) {
    buffer.push('$');
    buffer.push(node.name);
  },
  'apply-operator'(buffer) {
    buffer.push(')');
  },
  'node-pattern'(buffer, node) {
    const map = [];
    // const { properties } = node;
    // if (properties) {
    //   for (const entry in properties.entries) {
    //     const exp = [entry, ': ', ...walkNode(properties.entries[entry])];

    //     map.push(exp.join(''));
    //   }
    //   const long = map.length > 1;
    //   buffer.push(long ? '{\n  ' : '{ ');
    //   buffer.push(map.join(long ? ',\n  ' : ', '));
    //   buffer.push(long ? '\n}' : ' }');
    // }
    buffer.push(')');
  },
  identifier(buffer, node) {
    if (node.name.includes(' ')) {
      return;
    }
    buffer.push(node.name);
  },

  'merge-properties/identifier'() {
    return ' += ';
  },
};

function walkNode(node) {
  const buffer = [];
  walk(node, {
    enter(node, parent, prop, index) {
      const deepPath = parent ? `${parent.type}/${prop}` : null;
      const handler = onEnter[node.type];
      const deepHandler = onEnter[deepPath];

      if (typeof handler === 'function') {
        const out = handler.call(this, buffer, node, parent, prop, index);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      }

      if (typeof deepHandler === 'function') {
        const out = deepHandler.call(this, buffer, node, parent, prop, index);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      }

      if (parent && typeof listOps[`${parent.type}/${prop}`] === 'function') {
        // console.log(node, parent, prop, index);
        listOps[`${parent.type}/${prop}`].call(
          this,
          buffer,
          node,
          parent[prop],
          index,
        );
      }
    },
    leave(node, parent, prop, index) {
      const deepPath = parent ? `${parent.type}/${prop}` : null;
      const handler = onLeave[node.type];
      const deepHandler = onLeave[deepPath];

      if (typeof handler === 'function') {
        const out = handler.call(this, buffer, node, parent, prop, index);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      }

      if (typeof deepHandler === 'function') {
        const out = deepHandler.call(this, buffer, node, parent, prop, index);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      }
    },
  });

  return buffer;
}

module.exports = walkNode;
