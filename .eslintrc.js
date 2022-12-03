/*eslint-env node */

module.exports = {
  root: true,

  extends: "eslint:recommended",

  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  plugins: ["svelte3", "jest"],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  rules: {
    "no-prototype-builtins": "off",
    // setup function is intentionally uninvoked in injected script to allow for testing suite to run
    "no-unused-vars": [2, { vars: "all", varsIgnorePattern: "setup" }],
  },
  ignorePatterns: ["node_modules", "**/build/**"],
  globals: {
    chrome: "readonly",
  },
};
