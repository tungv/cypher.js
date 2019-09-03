module.exports = function makeWalker(enter) {
  function walk(
    node,
    parent = null,
    depth = 0,
    prop = null,
    index = 0,
    siblingCount = 0,
  ) {
    const { type } = node;

    const currentParams = [node, parent, prop, index, siblingCount, depth];
    if (!type) {
      return;
    }

    // fix parser bugs
    // 1 invalid projection alias
    if (type === 'projection' && node.alias && node.alias.name.match(/\W/)) {
      delete node.alias;
    }

    const optionalLeave = enter(...currentParams);

    const keys = Object.keys(node);

    keys.forEach(key => {
      const childOrProp = node[key];

      if (typeof childOrProp !== 'object' || childOrProp == null) {
        return;
      }
      if (Array.isArray(childOrProp)) {
        childOrProp.forEach((item, index) => {
          walk(item, node, depth + 1, key, index, childOrProp.length);
        });
        return;
      }

      if (key === 'entries') {
        Object.entries(childOrProp).forEach(([key, item], index, array) => {
          const propNode = {
            type: 'map-key',
            key,
            expression: item,
          };
          walk(propNode, node, depth + 1, 'map-key', index, array.length);
        });
        return;
      }

      walk(childOrProp, node, depth + 1, key);
    });

    if (typeof optionalLeave === 'function') {
      optionalLeave(...currentParams);
    }
  }

  return walk;
};
