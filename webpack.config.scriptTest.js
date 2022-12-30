/* This is the config for building the injected script for testing.
We need to expose the Router instance from the injected script to
the global context so Jest can have access to Router internals. 
So this config uses "testMain.js" as it's entry point, and exports a
module library.
*/

import { fileURLToPath } from "node:url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    injectedTest: ["./testing/utils/testMain.js"],
  },

  experiments: {
    outputModule: true,
  },

  output: {
    path: path.join(__dirname, "/extension/devtools/build"),
    filename: "[name].js",
    library: {
      type: "module",
    },
  },
  mode: "development",
};
