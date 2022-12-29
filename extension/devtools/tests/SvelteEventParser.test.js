/**
 * @jest-environment jsdom
 */
/*eslint-env jest */
import SvelteEventParser from "../src/SvelteEventParser.js";

describe("assignInstanceNumber", () => {
  const parser = new SvelteEventParser();
  test("it returns correct instance number based on component count", () => {
    const componentName1 = "App";
    const componentName2 = "Test";
    expect(parser.assignInstanceNumber(componentName1)).toBe(1);
    expect(parser.assignInstanceNumber(componentName1)).toBe(2);
    expect(parser.assignInstanceNumber(componentName2)).toBe(1);
    expect(parser.assignInstanceNumber(componentName2)).toBe(2);
  });
});

describe("assignComponentId", () => {
  const parser = new SvelteEventParser();
  test("it returns correct id string based on tagName and component count", () => {
    const componentName1 = "App";
    const componentName2 = "Test";
    expect(parser.assignComponentId(componentName1)).toBe("App1");
    expect(parser.assignComponentId(componentName2)).toBe("Test1");
    expect(parser.assignComponentId(componentName1)).toBe("App2");
    expect(parser.assignComponentId(componentName2)).toBe("Test2");
  });
  test("it correctly updates sequence of added components", () => {
    expect(parser.newComponents[0]).toBe("App1");
    expect(parser.newComponents[1]).toBe("Test1");
    expect(parser.newComponents[2]).toBe("App2");
    expect(parser.newComponents[3]).toBe("Test2");
  });
});
