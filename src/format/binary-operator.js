const { walk } = require('estree-walker');
const DEBUG = require('./DEBUG');
const priorities = [
  'and',
  'or',
  'xor',
  'not',
  'regex',
  'equal',
  'not-equal',
  'plus',
  'minus',
  'mult',
  'div',
  'mod',
  'pow',
  'in',
  'contains',
  'starts-with',
  'ends-with',
];

const toCypherSymbol = op => {
  const res = {
    minus: '-',
    plus: '+',
    mult: '*',
    div: '/',
    mod: '%',
    pow: '^',
    equal: '=',
    'starts-with': 'STARTS WITH',
    'ends-with': 'ENDS WITH',
    contains: 'CONTAINS',
    and: 'AND',
    or: 'OR',
    xor: 'XOR',
    not: 'NOT',

    'not-equal': '<>',
    'less-than': '<',
    'greater-than': '>',
    'less-than-equal': '<=',
    'greater-than-equal': '>=',
    'unary-plus': '+',
    'unary-minus': '-',
    regex: '=~',
    in: 'IN',
    'is-null': 'IS NULL',
    'is-not-null': 'IS NOT NULL',
  }[op];

  if (!res) {
    // console.error(op);
  }

  return res;
};

const getBinaryPriority = node => {
  return priorities.indexOf(node.op) || 0;
};

const onEnterExpression = {
  'apply-operator'(buffer, node) {
    buffer.push(node.funcName.value);
    buffer.push('(');

    buffer.push(
      ...node.args
        .map(arg => {
          const exp = [];
          walkExpression(exp, arg);
          return exp.join('');
        })
        .join(', '),
    );

    buffer.push(')');

    this.skip();
  },

  'subscript-operator'(buffer, node) {
    const exp = [];
    walkExpression(exp, node.expression);
    exp.push('[');
    walkExpression(exp, node.subscript);
    exp.push(']');
    buffer.push(exp.join(''));
    this.skip();
  },

  'binary-operator'(buffer, node, priority) {
    const exp = [];
    walkExpression(exp, node.arg1, priority);
    exp.push(' ', toCypherSymbol(node.op), ' ');
    walkExpression(exp, node.arg2, priority);

    buffer.push(exp.join(''));
    this.skip();
  },

  'unary-operator'(buffer, node) {
    const isPostfix = node.op === 'is-null' || node.op === 'is-not-null';
    const exp = [];
    if (!isPostfix) {
      exp.push(toCypherSymbol(node.op), ' ');
    }

    walkExpression(exp, node.arg);

    if (isPostfix) {
      exp.push(' ', toCypherSymbol(node.op));
    }

    buffer.push(exp.join(''));
    this.skip();
  },
  comparison(buffer, node) {
    const exp = [];

    node.args.reduce((arg1, arg2, index) => {
      walkExpression(exp, arg1);
      exp.push(' ', toCypherSymbol(node.ops[index - 1]), ' ');
      walkExpression(exp, arg2);
      return {};
    });

    buffer.push(exp.join(''));
    this.skip();
  },
  map(buffer, node) {
    const map = [];
    for (const entry in node.entries) {
      const exp = [entry, ': '];

      walkExpression(exp, node.entries[entry]);

      map.push(exp.join(''));
    }
    const long = map.length > 1;
    buffer.push(long ? '{\n  ' : '{ ');
    buffer.push(map.join(long ? ',\n  ' : ', '));
    buffer.push(long ? '\n}' : ' }');
  },
  true(buffer, node) {
    buffer.push(node.type);
  },
  string(buffer, node) {
    buffer.push(JSON.stringify(node.value));
  },
  integer(buffer, node) {
    buffer.push(JSON.stringify(node.value));
  },
};

const onLeaveExpression = {
  parameter(buffer, node) {
    buffer.push('$');
    buffer.push(node.name);
  },

  identifier(buffer, node) {
    buffer.push(node.name);
  },

  'prop-name'(buffer, node) {
    buffer.push('.');
    buffer.push(node.value);
  },
};

function walkExpression(buffer, root, parentPriority = -1) {
  const priority = getBinaryPriority(root);
  const higherPriority =
    parentPriority !== -1 && priority !== -1 && priority < parentPriority;
  if (higherPriority) {
    buffer.push('(');
  }

  walk(root, {
    enter(node, parent) {
      const handler = onEnterExpression[node.type];
      if (typeof handler === 'function') {
        const out = handler.call(this, buffer, node, parent, priority);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      } else if (typeof onLeaveExpression[node.type] !== 'function') {
        DEBUG.verbose() && console.log('>> (unhandled)', node.type);
      }
    },
    leave(node, parent) {
      const handler = onLeaveExpression[node.type];
      if (typeof handler === 'function') {
        const out = handler.call(this, buffer, node, parent, priority);
        if (typeof out === 'string') {
          buffer.push(out);
        }
      } else if (typeof onEnterExpression[node.type] !== 'function') {
        DEBUG.verbose() && console.log('<< (unhandled)', node.type);
      }
    },
  });

  if (higherPriority) {
    buffer.push(')');
  }
  return;
}

module.exports = walkExpression;
