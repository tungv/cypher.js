const walkExpression = require('./binary-operator');
const DEBUG = require('./DEBUG');
const { walk } = require('estree-walker');

const identity = x => x;

const onEnter = {
  match(buffer, node) {
    if (node.optional) {
      buffer.push('OPTIONAL ');
    }

    buffer.push('MATCH ');
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
      walkExpression(buffer, node.properties);
    }

    buffer.push(')');

    this.skip();
  },
  return(buffer, node) {
    buffer.push('RETURN ');
    if (node.distinct) {
      buffer.push('DISTINCT ');
    }
    if (node.includeExisting) {
      buffer.push('* ');
    }

    if (node.projections) {
      const projections = node.projections.map(proj => {
        const exp = [];
        walkExpression(exp, proj);
        return exp.join('');
      });

      buffer.push(projections.join(', '));
    }
  },
  create(buffer, node) {
    buffer.push('CREATE ');

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
  create() {
    return '\n';
  },
};

// eslint-disable-next-line no-unused-vars
function print(ast, transform = identity) {
  const buffer = [];

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

  return buffer.join('');
}

module.exports = print;
