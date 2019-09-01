const { walk } = require('estree-walker');
const printNode = require('./node');

const identity = x => x;

// eslint-disable-next-line no-unused-vars
function print(ast, transform = identity) {
  // transform
  function walkNode() {
    const M = new WeakMap();

    return function(handlers) {
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

  const buffer = printNode(ast);

  return buffer
    .join('')
    .replace(/\n{2,}/gm, '\n')
    .trim();
}

module.exports = print;
