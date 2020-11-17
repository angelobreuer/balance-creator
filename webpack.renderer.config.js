const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [
    {
      loader: "file-loader",
      options: {
        name: "[name].css",
        context: "./src/css/",
        outputPath: "css/",
        publicPath: "../",
      },
    },
    { loader: "extract-loader" },
    { loader: "css-loader" },
  ],
});

module.exports = {
  entry: {
    halfmoonCss: "./src/css/halfmoon.min.css",
    mainCss: "./src/css/main.css",
  },
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
    ],
  },
};
