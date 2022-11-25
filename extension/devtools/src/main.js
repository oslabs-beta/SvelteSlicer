import Listener from "./Listener.js";

(function startListener() {
  new Listener();
})();

/* const ComponentParser = require("./ComponentParser.js");

let slicer = (() => {
  const variables = {
    listeners: {}, // data re. app's event listeners to help with snapshot labeling
    nodes: new Map(), // data re. app's nodes stored with node instance as key
    storeVariables: {}, // actual store variable instances for injecting state
    node_id: 0, // track next unassigned value for sequential node id numbering
    firstLoadSent: false, // track whether or not initial snapshot has been sent
    jumpIndex: undefined, // hold index to most current jump
    rebuildingDom: false, // track whether we're jumping between past states or creating new ones
  };

  return {
    // method for all
    get: (variableName) => variables[variableName],

    // methods for componentCounts, componentObject, listeners, and storeVariables
    getValue: (variableName, key) => variables[variableName][key],
    has: (variableName, key) => variables[variableName].hasOwnProperty(key),
    update: (variableName, newValue, key) =>
      (variables[variableName][key] = newValue),
    delete: (variableName, key) => delete variables[variableName][key],

    // methods for components, deletedNodes, insertedNodes and stateHistory
    add: (variableName, value) => variables[variableName].push(value),
    reset: (variableName) =>
      variables[variableName].splice(0, variables[variableName].length),
    peek: (variableName) =>
      variables[variableName][variables[variableName].length - 1],

    // method for node_id
    increment: (variableName) => variables[variableName]++,

    // method for firstLoadSent, snapshotLabel, jumpIndex and rebuildingDom
    set: (variableName, value) => (variables[variableName] = value),

    // methods for nodes
    getNodeData: (node) => variables.nodes.get(node),
    setNodeData: (node, data) => variables.nodes.set(node, data),
    hasNode: (node) => variables.nodes.has(node),
  };
})();

function addSvelteDomListeners(root) {
  root.addEventListener("SvelteDOMInsert", insertNewNode);
  root.addEventListener("SvelteDOMRemove", removeNode);
  root.addEventListener("SvelteDOMAddEventListener", addEventListener);
}

(function setup() {
  new ComponentParser();
  addSvelteDomListeners(window);
  window.addEventListener("load", () => {
    captureSnapshot();
    startMutationObserver();
  });
  window.document.addEventListener("dom-changed", captureSnapshot);
  window.document.addEventListener("rebuild", sendRebuild);
  window.addEventListener("message", parseDevToolMessage);
})();

const deepClone = (inObject) => {
  let outObject, value, key;

  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  if (
    inObject.constructor.name !== "Object" &&
    inObject.constructor.name !== "Array"
  ) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepClone(value);
  }

  return outObject;
};

function removeNode(e) {
  const { node } = e.detail;
  const nodeData = slicer.getNodeData(node);
  if (nodeData) {
    slicer.add("deletedNodes", {
      id: nodeData.id,
      component: nodeData.component,
    });
  }
}

function insertNewNode(e) {
  const { node, target } = e.detail;
  if (node.__svelte_meta) {
    const id = slicer.increment("node_id");
    const componentName = getComponentName(node);
    let componentId;
    if (e.detail.hasOwnProperty("anchor") && e.detail.anchor === undefined) {
      componentId = componentName;
    } else {
      componentId = assignParent(node, target);
    }
    slicer.setNodeData(node, { id, componentName, componentId });
    slicer.add("insertedNodes", {
      target: slicer.getNodeData(target)
        ? slicer.getNodeData(target).id
        : target.nodeName + target.id,
      id,
      component: componentName,
      loc: node.__svelte_meta.loc.char,
    });
  }
}

function assignParent(node, target) {
  const nodeComponentName = getComponentName(node);
  const targetNode = slicer.getNodeData(target);
  const targetComponentName = targetNode.componentName;
  const parsedComponents = slicer.get("components");
  if (nodeComponentName !== targetComponentName) {
    for (let component of parsedComponents) {
      if (component.tagName === nodeComponentName) {
        // this node belongs to the next instance of this component
        if (component.parentId === undefined) {
          component.parentName = targetNode.componentId;
          component.parentId = targetNode.id;
          return component.id;
        }
        // this node belongs to an instance who's parent is already defined
        else if (component.parentId === targetNode.id) {
          return component.id;
        }
      }
    }
  } else {
    return targetNode.componentId;
  }
}

function addEventListener(e) {
  const { node, event } = e.detail;
  if (node.__svelte_meta) {
    if (!slicer.hasNode(node)) {
      const nodeId = slicer.increment("node_id");
      const componentName = getComponentName(node);
      slicer.setNodeData(node, { nodeId, componentName });
    }
    const nodeData = slicer.getNodeData(node);
    const listenerId = nodeData.id + event;
    node.addEventListener(event, () => updateLabel(nodeData.id, event));

    slicer.update(
      "listeners",
      {
        node: nodeData.id,
        event,
        handlerName: e.detail.handler.name,
        component: nodeData.componentName,
      },
      listenerId
    );
  }
}

function getComponentName(node) {
  const fileName = node.__svelte_meta.loc.file;

  // check if this is a Windows based file naming, ie. \ instead of /
  if (fileName.indexOf("/") === -1) {
    return fileName.slice(fileName.lastIndexOf("\\\\") + 1, -7);
  }

  return fileName.slice(fileName.lastIndexOf("/") + 1, -7);
}

function updateLabel(nodeId, event) {
  const listener = slicer.getValue("listeners", nodeId + event);
  const { component, handlerName } = listener;
  slicer.set("snapshotLabel", component + " - " + event + " -> " + handlerName);
  slicer.set("rebuildingDom", false);
}

function rebuildDom(tree, index) {
  slicer.set("jumpIndex", index);
  slicer.set("rebuildingDom", true);
  const componentObject = slicer.get("componentObject");
  const pastState = slicer.get("stateHistory")[index];

  tree.forEach((componentFile) => {
    for (let componentInstance in componentObject) {
      if (componentObject[componentInstance].tagName === componentFile) {
        if (pastState.hasOwnProperty(componentInstance)) {
          const variables = pastState[componentInstance];
          for (let variable in variables) {
            if (variable[0] === "$") {
              updateStore(variable, variables[variable]);
            } else {
              injectState(componentInstance, variable, variables[variable]);
            }
          }
        }
      }
    }
  });
}

function injectState(componentId, key, value) {
  const component = slicer.get("componentObject")[componentId].component;
  component.$inject_state({ [key]: value });
}

function updateStore(name, value) {
  const store = slicer.getValue("storeVariables", name.slice(1));
  store.set(value);
}

function clearSnapshots(index, path, clearType) {
  const stateHistory = slicer.get("stateHistory");
  if (clearType === "forward") {
    slicer.add("stateHistory", ...stateHistory.slice(0, index + 1));
  } else if (clearType === "previous") {
    slicer.add("stateHistory", ...stateHistory.slice(index));
  } else if (clearType === "path") {
    for (let i = stateHistory.length - 1; i > 0; i--) {
      if (!path.includes(i)) {
        stateHistory.splice(i, 1);
      }
    }
    slicer.reset("stateHistory");
    slicer.add("stateHistory", ...stateHistory);
  }
}

function startMutationObserver() {
  const observer = new MutationObserver(() => {
    const rebuildingDom = slicer.get("rebuildingDom");
    if (!rebuildingDom) {
      const domChange = new CustomEvent("dom-changed");
      window.document.dispatchEvent(domChange);
    } else {
      const rebuild = new CustomEvent("rebuild");
      window.document.dispatchEvent(rebuild);
    }
  });
  observer.observe(window.document, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function getSnapshotData() {
  const components = slicer.get("components");
  const deletedNodes = slicer.get("deletedNodes");
  const insertedNodes = slicer.get("insertedNodes");
  const componentObject = slicer.get("componentObject");
  const snapshotLabel = slicer.get("snapshotLabel");

  return {
    components,
    deletedNodes,
    insertedNodes,
    componentObject,
    snapshotLabel,
  };
}

function isNewState(snapshotData, currentState) {
  const { components, insertedNodes, deletedNodes } = snapshotData;
  const oldState = slicer.peek("stateHistory");
  if (
    JSON.stringify(currentState) !== JSON.stringify(oldState) ||
    components.length ||
    insertedNodes.length ||
    deletedNodes.length
  ) {
    return true;
  }
  return false;
}

function sendSnapshot(snapshotData, type) {
  const {
    components,
    insertedNodes,
    deletedNodes,
    deletedComponents,
    snapshotLabel,
    stateObject,
  } = snapshotData;

  window.postMessage({
    source: "panel.js",
    type,
    data: {
      stateObject,
      components,
      insertedNodes,
      deletedNodes,
      deletedComponents,
      snapshotLabel,
    },
  });
}

function resetSnapshotData() {
  slicer.reset("components");
  slicer.reset("deletedNodes");
  slicer.reset("insertedNodes");
  slicer.set("snapshotLabel", undefined);
}

function captureRawAppState() {
  const appState = {};
  const componentObject = slicer.get("componentObject");
  for (let component in componentObject) {
    const captureStateFunc =
      componentObject[component].component.$capture_state;
    let state = captureStateFunc ? captureStateFunc() : {};
    // if state object is empty, may need to use ctx instead (older version of Svelte)
    if (state && !Object.keys(state).length) {
      if (
        componentObject[component].component.$$.ctx.constructor.name ===
        "Object"
      ) {
        state = componentObject[component].component.$$.ctx;
      }
    }
    appState[component] = state;
  }
  return appState;
}

function parseComponentState(component) {
  const state = getComponentState(component);

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
      parsedState[variableName] = parseState(value, variableName);
    }
  }
  return parsedState;
}

function captureParsedAppState() {
  const appState = {};
  const componentObject = slicer.get("componentObject");
  for (let component in componentObject) {
    appState[component] = parseComponentState(
      componentObject[component].component
    );
  }
  return appState;
}

function captureSnapshot() {
  const snapshotData = getSnapshotData();
  const rawState = captureRawAppState();
  if (isNewState(snapshotData, rawState)) {
    snapshotData.deletedComponents = trimDeletedComponents(
      snapshotData.componentObject
    );
    slicer.add("stateHistory", deepClone(rawState));
    const type = setSnapshotType();
    snapshotData.stateObject = captureParsedAppState();
    console.log(snapshotData.stateObject);
    sendSnapshot(snapshotData, type);
    resetSnapshotData();
  }
}

function trimDeletedComponents(componentObject) {
  const deletedComponents = [];
  for (let component in componentObject) {
    if (componentObject[component].component.$$.fragment === null) {
      slicer.delete("componentObject", component);
      deletedComponents.push(component);
    }
  }
  return deletedComponents;
}

function setSnapshotType() {
  slicer.get("firstLoadSent");
  if (!slicer.get("firstLoadSent")) {
    slicer.set("firstLoadSent", true);
    return "firstLoad";
  }
  return "update";
}

function sendRebuild() {
  const snapshotData = getSnapshotData();
  const { components, componentObject } = snapshotData;
  const jumpIndex = slicer.get("jumpIndex");
  trimDeletedComponents(componentObject);

  components.forEach((newComponent) => {
    const { tagName, id } = newComponent;
    const component = componentObject[newComponent.id].component;
    const componentState = getComponentState(component);

    const previousState = slicer.get("stateHistory")[jumpIndex];
    for (let componentId in previousState) {
      if (
        JSON.stringify(previousState[componentId]) ===
          JSON.stringify(componentState) &&
        !componentObject.hasOwnProperty(componentId)
      ) {
        slicer.update("componentObject", { component, tagName }, componentId);
        newComponent.id = componentId;
        slicer.delete("componentObject", id);
        const newCount = slicer.getValue("componentCounts", tagName) - 1;
        slicer.update("componentCounts", newCount, tagName);
      }
    }
  });

  sendSnapshot(snapshotData, "rebuild");
  resetSnapshotData();
  slicer.set("jumpIndex", undefined);
}

function parseDevToolMessage(event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  // Only accept messages that we know are ours
  if (
    typeof event.data !== "object" ||
    event.data === null ||
    !event.data.source === "panel.js"
  ) {
    return;
  }

  if (event.data.type === "jumpState") {
    const { index, tree } = event.data;
    rebuildDom(tree, index);
  }

  if (event.data.type === "clearSnapshots") {
    const { index, path, clearType } = event.data;
    clearSnapshots(index, path, clearType);
  }
}

function type_of(value) {
  let type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  if (type === "object") {
    // check if it's a store variable
    if (value.hasOwnProperty("subscribe")) {
      // check if it's a writable store
      if (value.hasOwnProperty("set") && value.hasOwnProperty("update")) {
        type = "writable_store";
      } else {
        type = "non-writable_store";
      }
    } else {
      if (value.constructor.name !== "Object") {
        type = "unknown";
      }
    }
  }
  return type;
}

function getComponentState(component) {
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

function parseState(element, name = null) {
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
          value[i] = parseState(element[i], i);
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
} */
