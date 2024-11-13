// config-overrides.js
const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    https: require.resolve("https-browserify"),
    http: require.resolve("stream-http"),
    url: require.resolve("url"),
    buffer: require.resolve("buffer"), // Add buffer fallback
  };

  // Optional: Add plugins to define global variables, like Buffer
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  return config;
};
