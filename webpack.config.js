var path = require("path");
module.exports = {
  mode: 'none',
  entry: [path.join(__dirname, "output/load.js")],
  output: {
    path: __dirname,
    filename: "index.js"
  },
  resolve: {
    modules: [path.resolve(path.join(__dirname, "output"))]
  }
};
