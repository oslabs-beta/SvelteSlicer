/*eslint-env jest */
/*eslint no-unused-vars: [2, {vars: "all", varsIgnorePattern: "slicer"}] */
/**
 * @jest-environment jsdom
 */

const rewire = require("rewire");
const injected = rewire("../extension/devtools/injected.js");

const slicer = injected.__get__("slicer");

describe("getComponentName", () => {
  test("it should return a tagname given a valid Svelte file path", () => {
    const filePath = "src/App.svelte";
    const expectedResult = "App";
    const getComponentName = injected.__get__("getComponentName");
    expect(getComponentName(filePath)).toBe(expectedResult);
  });
});

describe("addSvelteDomListeners", () => {
  test("it should call correct function when given custom event is fired", () => {
    const addSvelteDomListeners = injected.__get__("addSvelteDomListeners");

    // mock associated functions
    const registerNewComponentMock = jest.fn();
    const insertNewNodeMock = jest.fn();
    const removeNodeMock = jest.fn();
    const addEventListenerMock = jest.fn();
    injected.__set__("registerNewComponent", registerNewComponentMock);
    injected.__set__("insertNewNode", insertNewNodeMock);
    injected.__set__("removeNode", removeNodeMock);
    injected.__set__("addEventListener", addEventListenerMock);

    // invoke function
    addSvelteDomListeners(window.document);

    // dispatch events
    const componentEvent = new Event("SvelteRegisterComponent");
    document.dispatchEvent(componentEvent);
    const insertEvent = new Event("SvelteDOMInsert");
    document.dispatchEvent(insertEvent);
    const removeEvent = new Event("SvelteDOMRemove");
    document.dispatchEvent(removeEvent);
    const addEventListenerEvent = new Event("SvelteDOMAddEventListener");
    document.dispatchEvent(addEventListenerEvent);

    expect(registerNewComponentMock).toHaveBeenCalledTimes(1);
    expect(insertNewNodeMock).toHaveBeenCalledTimes(1);
    expect(removeNodeMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledTimes(1);
  });
});

describe("assignComponentInstance", () => {
  test("it returns correct instance number based on component count", () => {
    const componentName1 = "App";
    const componentName2 = "Test";
    const assignComponentInstance = injected.__get__("assignComponentInstance");
    expect(assignComponentInstance(componentName1)).toBe(0);
    expect(assignComponentInstance(componentName1)).toBe(1);
    expect(assignComponentInstance(componentName2)).toBe(0);
    expect(assignComponentInstance(componentName2)).toBe(1);
  });
});
