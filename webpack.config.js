const path = require('path');

module.exports = {
  mode: "production",
  // devtool: "inline-source-map",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, 'dist'),
    library: "ts-event-bus",
    libraryTarget: 'umd',
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
}