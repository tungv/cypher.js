exports.getPriority = function getPriority(node) {
  if (!node) {
    return 0;
  }
  if (node.type === 'binary-operator') {
    return priorities.indexOf(node.op) || 0;
  }

  return 0;
};

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
    not: 'NOT ',

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
    return '';
  }

  return res;
};

exports.toCypherSymbol = toCypherSymbol;
