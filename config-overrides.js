const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    https: require.resolve("https-browserify"),
    http: require.resolve("stream-http"),
    url: require.resolve("url"),
    buffer: require.resolve("buffer"),
    process: require.resolve("process/browser.js"), // Ensure the extension is specified
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser.js", // Use the explicit path with extension
    }),
  ]);

  return config;
};
