import { expect, test } from "@jest/globals";

const sum = require("../sum");
// const diff = require('../src/Diffs');

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
