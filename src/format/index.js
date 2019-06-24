const { walk } = require('estree-walker');

const identity = x => x;

const onEnter = {
  match(buffer, node) {
    if (node.optional) {
      buffer.push('OPTIONAL ');
    }

    buffer.push('MATCH ');
  },

  'node-pattern'() {
    return '(';
  },
  identifier(buffer, node) {
    buffer.push(node.name);
  },
  parameter(buffer, node) {
    return `$${node.name}`;
  },
  return() {
    return 'RETURN ';
  },
  create(buffer, node) {
    buffer.push('CREATE ');

    if (node.unique) {
      buffer.push('UNIQUE ');
    }
  },
  label(buffer, node) {
    buffer.push(':', node.name);
  },
  string(buffer, node) {
    buffer.push(JSON.stringify(node.value));
  },
  integer(buffer, node) {
    buffer.push(String(node.value));
  },
};

const onLeave = {
  statement() {
    return ';';
  },
  'node-pattern'(buffer, node) {
    if (node.properties) {
      const map = [];
      for (const [key, value] of Object.entries(node.properties.entries)) {
        const entry = [key, ': ', print(value)].join('');
        map.push(entry);
      }

      const long = map.length > 1;

      buffer.push(long ? ' {\n  ' : ' { ');
      buffer.push(map.join(long ? ',\n  ' : ', '));
      buffer.push(long ? '\n}' : ' }');
    }
    buffer.push(')');
  },
  match() {
    return '\n';
  },
  create() {
    return '\n';
  },
  'prop-name'(buffer, node) {
    buffer.push('.', node.value);
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
        console.log('> (unhandled)', node.type);
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
        console.log('< (unhandled)', node.type);
      }
    },
  });

  return buffer.join('');
}

module.exports = print;
