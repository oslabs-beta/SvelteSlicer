module.exports = {  

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
      "no-unused-vars": [2, {vars: "all", varsIgnorePattern: "slicer"}]
    },
    settings: {
      // ...
    },
    ignorePatterns: ['node_modules', '**/build/**'],
    globals: {
      describe: "readonly",
      jest: "readonly",
      expect: "readonly",
      test: "readonly"
    }
  };