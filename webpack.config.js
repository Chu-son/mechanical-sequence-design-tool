const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // ...existing code...
};
