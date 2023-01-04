import { fileURLToPath } from "node:url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default () => {
  const mode = process.env.NODE_ENV || "development";

  return {
    entry: {
      injected: ["./extension/devtools/src/main.js"],
    },
    output: {
      path: path.join(__dirname, "/extension/devtools/build"),
      filename: "[name].js",
    },

    mode,
  };
};
