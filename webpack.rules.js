module.exports = [{
  test: /\.tsx?$/,
  exclude: /(node_modules|\.webpack)/,
  use: {
    loader: "ts-loader",
    options: {
      transpileOnly: true,
    },
  },
}, {
  test: /\.css$/,
  use: [
    "file-loader",
    "extract-loader",
    "css-loader",
  ],
}];