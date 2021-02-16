const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [
    "file-loader",
    "extract-loader",
    "css-loader",
  ],
});

rules.push({
  test: /\.svg/,
  use: {
    loader: "file-loader"
  },
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".css",
      ".eot",
      ".svg",
      ".ttf",
      ".woff",
      ".woff2",
      ".oft",
      ".svg",
    ],
  },
};