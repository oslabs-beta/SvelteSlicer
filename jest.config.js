/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.svelte$": [
      "svelte-jester",
      {
        compilerOptions: {
          dev: true,
        },
      },
    ],
  },
  moduleFileExtensions: ["js", "svelte"],
};

export default config;
