let DEBUG = false;

module.exports.verbose = () => DEBUG;
module.exports.loud = () => (DEBUG = true);
module.exports.silent = () => (DEBUG = false);
