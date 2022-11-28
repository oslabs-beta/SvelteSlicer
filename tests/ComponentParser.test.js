/**
 * @jest-environment jsdom
 */
/*eslint-env jest */
const ComponentParser = require("../extension/devtools/src/ComponentParser.js");

describe("assignComponentInstance", () => {
  const parser = new ComponentParser();
  test("it returns correct instance number based on component count", () => {
    const componentName1 = "App";
    const componentName2 = "Test";
    expect(parser.assignComponentInstance(componentName1)).toBe(1);
    expect(parser.assignComponentInstance(componentName1)).toBe(2);
    expect(parser.assignComponentInstance(componentName2)).toBe(1);
    expect(parser.assignComponentInstance(componentName2)).toBe(2);
  });
});
