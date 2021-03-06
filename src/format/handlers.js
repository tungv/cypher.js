const { getPriority, toCypherSymbol } = require('./binary-operator');

module.exports = {
  statement() {
    return () => ';';
  },

  query(buffer) {
    this.between('clauses', () => buffer.push(''));
  },

  match(buffer, node) {
    buffer.push('\n');
    if (node.optional) {
      buffer.push('OPTIONAL ');
    }

    buffer.push('MATCH ');
    this.before('predicate', () => buffer.push('\nWHERE '));
  },
  merge() {
    return '\nMERGE ';
  },
  'on-create'(buffer) {
    buffer.push('\nON CREATE SET ');
    this.between('items', () => {
      buffer.push(', ');
    });
  },
  'on-match'(buffer) {
    buffer.push('\nON MATCH SET ');
    this.between('items', () => {
      buffer.push(', ');
    });
  },
  'merge-properties'(buffer) {
    this.after('identifier', () => {
      buffer.push(' += ');
    });
  },
  call(buffer) {
    buffer.push('\nCALL ');

    this.before('args', () => buffer.push('('));
    this.between('args', () => buffer.push(', '));
    this.after('args', () => buffer.push(')\n'));

    this.before('projections', () => buffer.push('YIELD '));
  },
  'proc-name'(buffer, node) {
    buffer.push(node.value);
  },
  any(buffer) {
    buffer.push('any(');

    this.after('identifier', () => buffer.push(' IN '));
    this.before('predicate', () => buffer.push(' WHERE '));
    return () => buffer.push(')');
  },
  none(buffer) {
    buffer.push('none(');

    this.after('identifier', () => buffer.push(' IN '));
    this.before('predicate', () => buffer.push(' WHERE '));
    return () => buffer.push(')');
  },
  single(buffer) {
    buffer.push('single(');

    this.after('identifier', () => buffer.push(' IN '));
    this.before('predicate', () => buffer.push(' WHERE '));
    return () => buffer.push(')');
  },
  all(buffer) {
    buffer.push('all(');

    this.after('identifier', () => buffer.push(' IN '));
    this.before('predicate', () => buffer.push(' WHERE '));
    return () => buffer.push(')');
  },
  'node-pattern'(buffer) {
    buffer.push('(');
    this.before('properties', () => buffer.push(' '));
    return () => {
      buffer.push(')');
    };
  },
  label(buffer, node) {
    buffer.push(':', node.name);
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
    this.before('properties', () => buffer.push(' '));
    const emptyRel =
      node.reltypes.length === 0 &&
      node.identifier == null &&
      node.varLength == null;
    if (!emptyRel) buffer.push('[');

    return () => {
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
    };
  },
  reltype(buffer, node) {
    buffer.push(':', node.name);
  },
  range(buffer, node) {
    buffer.push('*');

    if (node.start) {
      buffer.push(node.start);
    }

    if (node.end) {
      buffer.push('..', node.end);
    }
  },
  identifier(buffer, node) {
    return node.name;
  },
  map(buffer, node) {
    const long = Object.keys(node.entries).length > 1;
    if (long) {
      buffer.push('{\n');
    } else {
      buffer.push('{ ');
    }

    this.between('map-key', () => {
      if (long) {
        buffer.push(',\n');
      } else {
        buffer.push(', ');
      }
    });

    return () => {
      if (long) {
        buffer.push('\n}');
      } else {
        buffer.push(' }');
      }
    };
  },
  'map-key'(buffer, node, parent, prop, index, siblingCount) {
    const long = siblingCount > 1;
    buffer.push(long ? '  ' : '', node.key, ': ');
  },
  set(buffer) {
    buffer.push('\nSET ');
  },
  'set-property'(buffer) {
    this.before('expression', () => {
      buffer.push(' = ');
    });
  },
  'map-projection-property'(buffer, node, parent, prop, index, siblingCount) {
    this.before('propName', () => {
      buffer.push('.');
    });
    if (index === 0) {
      buffer.push(' { ');
    }

    if (index === siblingCount - 1) {
      return () => buffer.push(' }');
    }

    return () => ', ';
  },
  'map-projection-literal'(buffer, node, parent, prop, index, siblingCount) {
    this.after('propName', () => {
      buffer.push(': ');
    });
    if (index === 0) {
      buffer.push(' { ');
    }

    if (index === siblingCount - 1) {
      return () => buffer.push(' }');
    }

    return () => ', ';
  },
  'pattern-comprehension'(buffer) {
    this.before('predicate', () => buffer.push(' WHERE '));
    buffer.push('[');
    this.before('eval', () => {
      buffer.push(' | ');
    });
    return () => {
      return ']';
    };
  },
  create(buffer, node) {
    buffer.push('\nCREATE ');

    if (node.unique) {
      buffer.push('UNIQUE ');
    }
  },
  delete(buffer, node) {
    buffer.push('\n');
    if (node.detach) {
      buffer.push('DETACH ');
    }

    buffer.push('DELETE ');
  },
  unwind(buffer) {
    buffer.push('UNWIND ');
    this.before('alias', () => {
      buffer.push(' AS ');
    });
    return () => '\n';
  },
  with(buffer, node) {
    buffer.push('\nWITH ');
    walkProjections(this, buffer, node);
    return () => '\n';
  },
  return(buffer, node) {
    buffer.push('\nRETURN ');
    walkProjections(this, buffer, node);
  },
  'order-by'(buffer) {
    buffer.push(' ORDER BY ');
  },
  'sort-item'(buffer, node) {
    return () => {
      if (node.ascending === false) {
        buffer.push(' DESC ');
      }
    };
  },
  projection(buffer, node, parent, prop, index, siblingCount) {
    this.before('alias', () => buffer.push(' AS '));
    if (index !== siblingCount - 1) {
      return () => ', ';
    }
  },
  'binary-operator'(buffer, node, parent) {
    const priority = getPriority(node);
    const parentPriority = getPriority(parent);

    if (parentPriority && priority < parentPriority) {
      buffer.push('(');
    }

    this.before('arg2', () => buffer.push(' ', toCypherSymbol(node.op), ' '));
    return () => {
      if (parentPriority && priority < parentPriority) {
        buffer.push(')');
      }
    };
  },
  'unary-operator'(buffer, node) {
    const isPostfix = node.op === 'is-null' || node.op === 'is-not-null';
    const symbol = toCypherSymbol(node.op);

    if (!isPostfix) {
      buffer.push(symbol);
    }

    if (isPostfix) {
      return () => buffer.push(' ', symbol);
    }
  },
  'subscript-operator'(buffer) {
    this.before('subscript', () => {
      buffer.push('[');
    });
    this.after('subscript', () => {
      buffer.push(']');
    });
  },
  parameter(buffer, node) {
    return `$${node.name}`;
  },
  'property-operator'(buffer) {
    this.before('propName', () => {
      buffer.push('.');
    });
  },
  'apply-operator'(buffer, node) {
    this.after('funcName', () => {
      buffer.push('(');

      if (node.distinct) {
        buffer.push('DISTINCT ');
      }
    });

    this.between('args', () => {
      buffer.push(', ');
    });

    return () => {
      buffer.push(')');
    };
  },
  'apply-all-operator'(buffer, node) {
    this.after('funcName', () => {
      if (node.distinct) {
        buffer.push('(DISTINCT *)');
      } else {
        buffer.push('(*)');
      }
    });
  },
  'function-name'(buffer, node) {
    buffer.push(node.value);
  },
  'prop-name'(buffer, node) {
    buffer.push(node.value);
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

function walkProjections(ctx, buffer, node) {
  if (node.distinct) {
    buffer.push('DISTINCT ');
  }

  if (node.includeExisting) {
    buffer.push('* ');
  }
  ctx.before('skip', () => {
    buffer.push(' SKIP ');
  });

  ctx.before('limit', () => {
    buffer.push(' LIMIT ');
  });
}
