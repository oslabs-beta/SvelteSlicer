/*eslint-env node */

module.exports = {
  root: true,

  extends: "eslint:recommended",

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  plugins: ["svelte3"],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  rules: {
    "no-prototype-builtins": "off",
  },
  ignorePatterns: ["node_modules", "**/build/**"],
  globals: {
    chrome: "readonly",
  },
};
