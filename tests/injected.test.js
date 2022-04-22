/**
 * @jest-environment jsdom
 */

const rewire = require('rewire');
const injected = rewire('../extension/devtools/injected.js');

let slicer = (() => {
  const variables = {
    components: [], // parsed component data to be sent in snapshot
    deletedNodes: [], // parsed data re. deleted nodes to be sent in snapshot
    insertedNodes: [], // parsed data re. inserted nodes to be sent in snapshot
    componentCounts: {}, // count of components with shared tagnames for instance numbering
    componentObject: {}, // actual component instances for injecting state
    listeners: {}, // data re. app's event listeners to help with snapshot labeling
    stateHistory: [], // copies of raw state snapshots to help recreate previous states
    nodes: new Map(), // data re. app's nodes stored with node instance as key
    storeVariables: {}, // actual store variable instances for injecting state
    node_id: 0, // track next unassigned value for sequential node id numbering
    firstLoadSent: false, // track whether or not initial snapshot has been sent
    snapshotLabel: 'Init', // hold label for snapshot
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

    // method for node_id
    increment: (variableName) => variables[variableName]++,

    // method for firstLoadSent, snapshotLabel, jumpIndex and rebuildingDom
    set: (variableName, value) => (variables[variableName] = value),

    // methods for nodes
    getNodeData: (node) => variables.nodes.get(node),
    setNodeData: (node, data) => variables.nodes.set(node, data),
    hasNode: (node) => variables.nodes.has(node),
  };
});

beforeAll(()=> {
  slicer();
})

describe('getComponentName', () => {
  test('it should return a tagname given a valid Svelte file path', () => {
    const filePath = 'src/App.svelte';
    const expectedResult = 'App';
    const getComponentName = injected.__get__('getComponentName');
    expect(getComponentName(filePath)).toBe(expectedResult);
  });
});

describe('addSvelteDomListeners', () => {
  test('it should call correct function when given custom event is fired', () => {
    const addSvelteDomListeners = injected.__get__('addSvelteDomListeners');
    
    const registerNewComponentMock = jest.fn();
    const insertNewNodeMock = jest.fn();
    const removeNodeMock = jest.fn();
    const addEventListenerMock = jest.fn();
    injected.__set__('registerNewComponent', registerNewComponentMock);
    injected.__set__('insertNewNode', insertNewNodeMock);
    injected.__set__('removeNode', removeNodeMock);
    injected.__set__('addEventListener', addEventListenerMock);
    
    addSvelteDomListeners(window.document);

    const componentEvent = new Event('SvelteRegisterComponent');
    document.dispatchEvent(componentEvent);
    const insertEvent = new Event('SvelteDOMInsert');
    document.dispatchEvent(insertEvent);
    const removeEvent = new Event('SvelteDOMRemove');
    document.dispatchEvent(removeEvent);
    const addEventListenerEvent = new Event('SvelteDOMAddEventListener');
    document.dispatchEvent(addEventListenerEvent);

    expect(registerNewComponentMock).toHaveBeenCalledTimes(1);
    expect(insertNewNodeMock).toHaveBeenCalledTimes(1);
    expect(removeNodeMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledTimes(1);
  });
});

describe('assignComponentInstance', () => {
  test('it returns correct instance number based on component count', () => {
    const componentName1 = 'App';
    const componentName2 = 'Test';
    const assignComponentInstance = injected.__get__('assignComponentInstance');
    expect(assignComponentInstance(componentName1)).toBe(0);
    expect(assignComponentInstance(componentName1)).toBe(1);
    expect(assignComponentInstance(componentName2)).toBe(0);
    expect(assignComponentInstance(componentName2)).toBe(1);
  }) 
})
