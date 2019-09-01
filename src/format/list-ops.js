module.exports = {
  'apply-operator/args'(buffer, node, array, index) {
    if (index !== 0) {
      buffer.push(', ');
    }
  },
};
