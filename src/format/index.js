const { verbose } = require('./DEBUG');
const handlers = require('./handlers');
const makeWalker = require('./makeWalker');

function print(ast, transform) {
  const root = ast.root || ast;
  const ctx = {
    buffer: ['\n'],
    before: new WeakMap(),
    after: new WeakMap(),
    between: new WeakMap(),
  };

  if (transform) {
    let transformHandlers = {};

    const capture = function(_transformHandlers) {
      transformHandlers = _transformHandlers;
    };

    transform(capture);

    const transformWalk = makeWalker((node, parent) => {
      const handler = transformHandlers[node.type];

      if (typeof handler === 'function') {
        const leave = handler(node, parent);

        return leave;
      }
    });

    transformWalk(root);
  }

  const walk = makeWalker(function(
    node,
    parent,
    prop,
    index,
    siblingCount,
    depth,
  ) {
    const handler = handlers[node.type];
    let unhandled = typeof handler !== 'function';
    let posthooks = [];
    let betweenHooks = [];

    if (ctx.before.has(parent)) {
      const beforeHandlers = ctx.before.get(parent);
      if (beforeHandlers[prop]) {
        unhandled = false;
        beforeHandlers[prop].forEach(prehook => {
          prehook();
        });
      }
    }
    if (ctx.after.has(parent)) {
      const afterHandlers = ctx.after.get(parent);
      if (afterHandlers[prop]) {
        unhandled = false;
        posthooks = afterHandlers[prop];
      }
    }

    if (ctx.between.has(parent)) {
      const betweenHandlers = ctx.between.get(parent);
      if (betweenHandlers[prop]) {
        unhandled = false;
        betweenHooks = betweenHandlers[prop];
      }
    }

    if (unhandled && verbose()) {
      return logUnhandled(node, parent, prop, index, siblingCount, depth);
    }

    const api = {
      before(key, handler) {
        let handlers;
        if (ctx.before.has(node)) {
          handlers = ctx.before.get(node);
        } else {
          handlers = {};
          ctx.before.set(node, handlers);
        }
        handlers[key] = handlers[key] || [];
        handlers[key].push(handler);
      },
      after(key, handler) {
        let handlers;
        if (ctx.after.has(node)) {
          handlers = ctx.after.get(node);
        } else {
          handlers = {};
          ctx.after.set(node, handlers);
        }
        handlers[key] = handlers[key] || [];
        handlers[key].push(handler);
      },
      between(key, handler) {
        let handlers;
        if (ctx.between.has(node)) {
          handlers = ctx.between.get(node);
        } else {
          handlers = {};
          ctx.between.set(node, handlers);
        }
        handlers[key] = handlers[key] || [];
        handlers[key].push(handler);
      },
    };

    const leave = handler
      ? handler.call(api, ctx.buffer, node, parent, prop, index, siblingCount)
      : null;

    if (typeof leave === 'function') {
      return (...args) => {
        if (siblingCount >= 2 && index < siblingCount - 1) {
          betweenHooks.forEach(hook => hook());
        }
        const out = leave(...args);

        if (typeof out === 'string') {
          ctx.buffer.push(out);
        }
        posthooks.forEach(hook => hook());
      };
    }

    if (typeof leave === 'string') {
      ctx.buffer.push(leave);
    }

    return () => {
      if (siblingCount >= 2 && index < siblingCount - 1) {
        betweenHooks.forEach(hook => hook());
      }
      posthooks.forEach(hook => hook());
    };
  });

  walk(root);

  return ctx.buffer
    .join('')
    .split(/\n{2,}/gm)
    .join('\n')
    .trim('\n');
}

module.exports = print;

function logUnhandled(node, parent, prop, index, siblingCount, depth) {
  if (siblingCount) {
    console.log(
      '%s> [%s] (%s.%s #%d/%d)',
      ' '.repeat(depth),
      node.type,
      parent.type,
      prop,
      index + 1,
      siblingCount,
      '[',
      Object.keys(node)
        .filter(k => k !== 'type')
        .join(', '),
      ']',
    );
    return () => {
      console.log(
        '%s< [%s] (%s.%s #%d/%d)',
        ' '.repeat(depth),
        node.type,
        parent.type,
        prop,
        index + 1,
        siblingCount,
      );
    };
  }

  console.log(
    '%s> [%s]',
    ' '.repeat(depth),
    node.type,
    '[',
    Object.keys(node)
      .filter(k => k !== 'type')
      .join(', '),
    ']',
  );

  return () => {
    console.log('%s< [%s]', ' '.repeat(depth), node.type);
  };
}
