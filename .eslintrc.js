module.exports = {
    root: true,  

    extends: 'eslint:recommended', 

    parserOptions: {
      ecmaVersion: 2019,
      sourceType: 'module'
    },
    env: {
      es6: true,
      browser: true
    },
    plugins: [
      'svelte3'
    ],
    overrides: [
      {
        files: ['*.svelte'],
        processor: 'svelte3/svelte3'
      }
    ],
    rules: {
      "no-prototype-builtins": "off"
    },
    settings: {
      // ...
    },
    ignorePatterns: ['node_modules', '**/build/**'],
    globals: {
      chrome: "readonly",
      module: "writable",
      require: "readonly",
    }
  };