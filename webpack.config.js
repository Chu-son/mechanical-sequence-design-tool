const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
    },
  },
  // ...existing code...
};
