/* const { type_of, deepClone } = require("./utils.js");

module.exports = class ComponentParser {
  constructor() {
    this.componentCounts = {};
    const callback = this.sendNewComponentData.bind(this);
    window.addEventListener("SvelteRegisterComponent", callback);
  }

  parseComponentState(component) {
    const state = this.getComponentState(component);

    const parsedState = {};
    const newStoreVariables = {};
    for (let variableName in state) {
      const value = state[variableName];
      if (type_of(value) === "writable_store") {
        newStoreVariables[variableName] = value;
      } else if (
        typeof value !== "function" &&
        type_of(value) !== "non-writable_store"
      ) {
        parsedState[variableName] = this.parseState(value, variableName);
      }
    }

    return { parsedState, newStoreVariables };
  }

  getComponentState(component) {
    const captureStateFunc = component.$capture_state;
    let state = captureStateFunc ? captureStateFunc() : {};
    // if capture_state produces an empty object, may need to use ctx instead (older version of Svelte)
    if (state && !Object.keys(state).length) {
      if (component.$$.ctx.constructor.name === "Object") {
        state = deepClone(component.$$.ctx);
      }
    }
    return state;
  }

  parseState(element, name = null) {
    let value;
    if (element === null) {
      value = element;
    } else if (typeof element === "function") {
      value = element.toString();
    } else if (typeof element === "object") {
      if (element.constructor) {
        if (
          element.constructor.name === "Object" ||
          element.constructor.name === "Array"
        ) {
          value = {};
          for (let i in element) {
            value[i] = this.parseState(element[i], i);
          }
        } else {
          value = "<" + element.constructor.name + ">";
        }
      } else {
        value = "Unknown Object";
      }
    } else {
      value = element;
    }

    return {
      value,
      name,
    };
  }
};

*/
