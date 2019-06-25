const walkExpression = require('./binary-operator');
const DEBUG = require('./DEBUG');
const { walk } = require('estree-walker');

const identity = x => x;

function walkProjections(buffer, node) {
  if (node.distinct) {
    buffer.push('DISTINCT ')
  }

  if (node.includeExisting) {
    buffer.push('* ')
  }

  if (node.projections) {
    const projections = node.projections.map(proj => {
      const exp = [];
      walkExpression(exp, proj);

      if (proj.alias) {
        exp.push(' AS ', proj.alias.name);
      }
      return exp.join('');
    });

    buffer.push(projections.join(', '));
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

  'on-create'() {
    return '\nON CREATE ';
  },
  'on-match'() {
    return '\nON MATCH ';
  },
  with(buffer, node) {
    buffer.push('\nWITH ')

    walkProjections(buffer, node);
  },

  'set-property'(buffer, node) {
    buffer.push('SET ');
    const prop = [];
    walkExpression(prop, node.property);
    prop.push(' = ');
    walkExpression(prop, node.expression);

    buffer.push(prop.join(''));
  },

  'node-pattern'(buffer, node) {
    buffer.push('(');

    if (node.identifier) {
      buffer.push(node.identifier.name);
    }

    if (node.labels) {
      buffer.push(...node.labels.map(l => `:${l.name}`));
    }

    if (node.properties) {
      buffer.push(' ');
      walkExpression(buffer, node.properties);
    }

    buffer.push(')');

    this.skip();
  },
  'rel-pattern'(buffer, node) {
    if (node.direction === 0) {
      buffer.push('<-');
    }
    if (node.direction === 1) {
      buffer.push('-');
    }

    buffer.push('[');

    if (node.identifier) {
      buffer.push(node.identifier.name);
    }

    if (node.reltypes) {
      buffer.push(...node.reltypes.map(l => `:${l.name}`));
    }

    if (node.properties) {
      buffer.push(' ');
      walkExpression(buffer, node.properties);
    }

    buffer.push(']');

    if (node.direction === 0) {
      buffer.push('-');
    }
    if (node.direction === 1) {
      buffer.push('->');
    }
  },
  return(buffer, node) {
    buffer.push('\nRETURN ');
    walkProjections(buffer, node);
  },
  create(buffer, node) {
    buffer.push('\nCREATE ');

    if (node.unique) {
      buffer.push('UNIQUE ');
    }
  },
};

const onLeave = {
  statement() {
    return ';';
  },
  match(buffer, node) {
    if (node.predicate) {
      buffer.push('\nWHERE ');
      walkExpression(buffer, node.predicate);
    }

    buffer.push('\n');
  },
};

// eslint-disable-next-line no-unused-vars
function print(ast, transform = identity) {
  const buffer = [];

  // transform
  function walkNode() {
    const M = new WeakMap();

    return function (handlers) {
      walk(ast, {
        enter(node) {
          const handler = handlers[node.type];

          if (typeof handler === 'function') {
            const onLeave = handler(node);
            if (typeof onLeave === 'function') {
              M.set(node, onLeave);
            }
          }
        },
        leave(node) {
          if (M.has(node)) {
            const fn = M.get(node);
            fn();
          }
        },
      });
    };
  }

  transform(walkNode());

  walk(ast, {
    enter(node, parent, prop, index) {
      const handler = onEnter[node.type];
      if (typeof handler === 'function') {
        const out = handler.call(this, buffer, node, parent, prop, index);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      } else if (typeof onLeave[node.type] !== 'function') {
        DEBUG.verbose() && console.log('> (unhandled)', node.type);
      }
    },
    leave(node, parent, prop, index) {
      const handler = onLeave[node.type];
      if (typeof handler === 'function') {
        const out = handler.call(this, buffer, node, parent, prop, index);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      } else if (typeof onEnter[node.type] !== 'function') {
        DEBUG.verbose() && console.log('< (unhandled)', node.type);
      }
    },
  });

  return buffer
    .join('')
    .replace(/\n{2,}/gm, '\n')
    .trim();
}

module.exports = print;
