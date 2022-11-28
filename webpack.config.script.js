const path = require("path");

module.exports = {
  entry: {
    injected: ["./extension/devtools/src/main.js"],
  },
  output: {
    path: path.join(__dirname, "/extension/devtools/build"),
    filename: "[name].js",
  },
  mode: "none",
};
