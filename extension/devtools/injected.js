let firstLoadSent = false;
let rebuildingDom = false;
let snapshotLabel = "Init";
let jumpIndex;

let slicer = (() => {
    const variables = {
        components: [],
        deletedNodes: [],
        insertedNodes: [],
        componentCounts: {},
        componentObject: {},
        listeners: {},
        stateHistory: [],
        nodes: {},
        storeVariables: {},
        node_id: 0
    }

    return {
        get: (variableName) => variables[variableName],
        getValue: (variableName, key) => variables[variableName][key],
        has: (variableName, key) => variables[variableName].hasOwnProperty(key),
        add: (variableName, value) => variables[variableName].push(value),
        reset: (variableName) => variables[variableName].splice(0, variables[variableName].length),
        update: (variableName, newValue, key) => variables[variableName][key] = newValue,
        delete: (variableName, key) => delete variables[variableName][key],
        increment: (variableName) => variables[variableName]++,
        reassign: (variableName, value) => variables[variableName] = value
    };
})();

function addSvelteDomListeners(root) {
    root.addEventListener('SvelteRegisterComponent', registerNewComponent);
    root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
    root.addEventListener('SvelteDOMRemove', svelteDOMRemove);
    root.addEventListener('SvelteDOMAddEventListener', svelteDOMAddEventListener); 
}

function setup() {
    addSvelteDomListeners(window);
    window.addEventListener('load', () => {captureSnapshot(); startMutationObserver();});
    window.document.addEventListener('dom-changed', captureSnapshot);
    window.document.addEventListener('rebuild', sendRebuild);
    window.addEventListener('message', parseDevToolMessage);
}
  
function registerNewComponent(e) {
    const {id, state, tagName, instance, target, component} = parseNewComponent(e.detail);
    slicer.add('components', {id, state, tagName, instance, target});
    slicer.update('componentCounts', instance, tagName);
    slicer.update('componentObject', {component, tagName}, id);
}

function parseNewComponent (detail) {                       
    const { component, tagName, options } = detail;
    const {id, instance} = assignComponentId(tagName);
    const state = parseComponentState(component);
    const target = assignComponentTarget(options);

    return {
        id,
        state,
        tagName,
        instance,
        target,
        component
    }
}

function assignComponentId(tagName) {
    let instance = 0;
    if (slicer.has('componentCounts', tagName)) {
        instance = slicer.getValue('componentCounts', tagName) + 1;
    }
    const id = tagName + instance;
    return {instance, id};
}

function assignComponentTarget(options) {
    return (options.target) ? options.target.nodeName + options.target.id : null;
}

function parseState(element, name = null) {
    let value;
    if (element === null) {
        value = element;
    }
    else if (typeof element === "function") {
        value = element.toString()
    }
    else if (typeof element === "object") {
        if (element.constructor) {
            if (element.constructor.name === "Object" || element.constructor.name === "Array") {
                value = {};
                for (let i in element) {
                    value[i] = parseState(element[i], i);
                }
            }
            else {
                value = '<' + element.constructor.name + '>'
            }
        }
        else {
            value = "Unknown Object"
        }
    }
    else {
        value = element;
    }

    return {
        value,
        name
    }
}

function parseComponentState(component) {
    const state = getComponentState(component);

    const parsedState = {};
    for (let variableName in state) {
        const value = state[variableName];
        if (type_of(value) === 'writable_store') {
            slicer.update('storeVariables', value, variableName);
        }
        else if (typeof value !== "function" && typeof value !== 'non-writable_store') {
            parsedState[variableName] = parseState(value, variableName);
        }
    }
    return parsedState;
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

function type_of(value) {
    let type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    if (type === "object") {
        // check if it's a store variable
        if (value.hasOwnProperty("subscribe")) {
            // check if it's a writable store
            if (value.hasOwnProperty("set") && (value.hasOwnProperty("update"))) {
                type = "writable_store";
            }
            else {
                type = "non-writable_store";
            }
        }
        else {
            if (value.constructor.name !== "Object") {
                type = "unknown"
            }
        }
    }    
    return type;
}

function svelteDOMRemove(e) {
    const { node } = e.detail;
    const nodeData = slicer.getValue('nodes', node);
    if (nodeData) {
        slicer.add('deletedNodes', {
            id: nodeData.id,
            component: nodeData.component
        })
    }
}

function svelteDOMInsert(e) {  
    const { node, target } = e.detail;
    if (node.__svelte_meta) {
        let id = slicer.getValue('nodes', node);
        if (!id) {
            id = slicer.increment('node_id');
            componentName = getComponentName(node.__svelte_meta.loc.file)
            slicer.update('nodes', {id, componentName}, node);
        }
        slicer.add('insertedNodes', {
            target: ((slicer.get('nodes', target)) ? (slicer.get('nodes', target)).id : target.nodeName + target.id),
            id,
            component: componentName, 
            loc: node.__svelte_meta.loc.char
        });
    }
}

function svelteDOMAddEventListener(e) {
    const { node, event } = e.detail;
    if (node.__svelte_meta) {
        if (!slicer.has('nodes', node)) {
            const nodeId = slicer.increment('node_id');
            const componentName = getComponentName(node.__svelte_meta.loc.file)
            slicer.update('nodes', {nodeId, componentName}, node);
        }
        const nodeData = slicer.getValue('nodes', node);
        const listenerId = nodeData.id + event;
        node.addEventListener(event, () => updateLabel(nodeData.id, event));
        
        slicer.update('listeners', listenerId, {
            node: nodeData.id,
            event,
            handlerName: e.detail.handler.name,
            component: nodeData.componentName,
        })
    }
}

function getComponentName(file) {
    if (file.indexOf('/') === -1) {
        tagName = file.slice((file.lastIndexOf('\\\\') + 1), -7);
    }
    else {
        tagName = file.slice((file.lastIndexOf('/') + 1), -7);
    }
    return tagName;
}

const deepClone = (inObject) => {
    let outObject, value, key
  
    if (typeof inObject !== "object" || inObject === null) {
      return inObject // Return the value if inObject is not an object
    }
  
    if (inObject.constructor.name !== "Object" && inObject.constructor.name !== "Array") {
        return inObject // Return the value if inObject is not an object
    }

    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {}
  
    for (key in inObject) {
      value = inObject[key]
  
      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepClone(value)
    }
  
    return outObject
}

function updateLabel(nodeId, event) {
    const listener = slicer.getValue('listeners', nodeId + event);
    const { component, handlerName } = listener;
    snapshotLabel = component + ' - ' + event + " -> " + handlerName;
    rebuildingDom = false;
}

function rebuildDom(tree) {
    rebuildingDom = true;
    const componentObject = slicer.get('componentObject');
    const pastState = slicer.get('stateHistory')[jumpIndex];
    
    tree.forEach(componentFile => {
        for (let componentInstance in componentObject) {
            if (componentObject[componentInstance].tagName === componentFile) {
                if (pastState.hasOwnProperty(componentInstance)) {
                    const variables = pastState[componentInstance];
                    for (let variable in variables) {
                        if (variable[0] === '$') {
                            updateStore(variable, variables[variable]);
                        }
                        else {
                            injectState(componentInstance, variable, variables[variable]);
                        }
                    }
                }
            }
        }
    })
}

function injectState(componentId, key, value) {
    const component = slicer.get('componentObject')[componentId].component;
    component.$inject_state({ [key]: value })
}

function updateStore(name, value) {
    const store = slicer.getValue('storeVariables', name.slice(1));
    store.set(value);
}

function clearSnapshots(index, path, clearType) {
    const stateHistory = slicer.get('stateHistory');
    if (clearType === 'forward') {
        slicer.add('stateHistory', ...stateHistory.slice(0, index + 1));
    }
    else if (clearType === 'previous') {
        slicer.add('stateHistory', ...stateHistory.slice(index));
    }
    else if (clearType === 'path') {
        for (let i = stateHistory.length -1; i > 0 ; i--){
            if (!path.includes(i)){
                stateHistory.splice(i,1);
            }
        }
        slicer.reset('stateHistory');
        slicer.add('stateHistory', ...stateHistory)
    }
}

function startMutationObserver() {
    const observer = new MutationObserver(() => {
        if (!rebuildingDom){
            const domChange = new CustomEvent('dom-changed');
            window.document.dispatchEvent(domChange)
        }
        else {
            const rebuild = new CustomEvent('rebuild');
            window.document.dispatchEvent(rebuild);
        }
    });
    observer.observe(window.document, {attributes: true, childList: true, subtree: true});
}

    
function getSnapshotData() {
    const components = slicer.get('components');
    const deletedNodes = slicer.get('deletedNodes');
    const insertedNodes = slicer.get('insertedNodes');
    const componentObject = slicer.get('componentObject');

    return {components, deletedNodes, insertedNodes, componentObject};
}

function verifyChange(snapshotData) {
    const { components, insertedNodes, deletedNodes } = snapshotData;
    if (components.length || insertedNodes.length || deletedNodes.length) {
        return true
    }
    return false;
}

function sendSnapshot(snapshotData, type) {
    const {components, insertedNodes, deletedNodes, deletedComponents} = snapshotData;
    window.postMessage({
        source: 'panel.js',
        type,
        data: {
            stateObject: captureParsedAppState(),
            components,
            insertedNodes,
            deletedNodes,
            deletedComponents,
            snapshotLabel
        }
    })
}

function resetSnapshotData() {
    slicer.reset('components');
    slicer.reset('deletedNodes');
    slicer.reset('insertedNodes');
    snapshotLabel = undefined;
}  

function captureRawAppState() {
    const appState = {};
    const componentObject = slicer.get('componentObject');
    for (let component in componentObject) {
        const captureStateFunc = componentObject[component].component.$capture_state;
        let state = captureStateFunc ? captureStateFunc() : {};
        // if state object is empty, may need to use ctx instead (older version of Svelte)
        if (state && !Object.keys(state).length) {
            if (componentObject[component].component.$$.ctx.constructor.name === "Object") {
                state = componentObject[component].component.$$.ctx;
            }
        }
        appState[component] = state;
    }
    return appState;
}

function captureParsedAppState() {
    const appState = {};
    const componentObject = slicer.get('componentObject');
    for (let component in componentObject) {
        appState[component] = parseComponentState(componentObject[component].component);
    }
    return appState;
}

function captureSnapshot() {
    const snapshotData = getSnapshotData();
    if (verifyChange(snapshotData)) {
        snapshotData.deletedComponents = trimDeletedComponents(snapshotData.componentObject);
        slicer.add('stateHistory', (deepClone(captureRawAppState())));
        const type = setSnapshotType();
        sendSnapshot(snapshotData, type);
        resetSnapshotData();
    }
}

function trimDeletedComponents(componentObject) {
    deletedComponents = [];
    for (let component in componentObject) {
        if (componentObject[component].component.$$.fragment === null) {
            slicer.delete('componentObject', component);
            deletedComponents.push(component);
        }
    }
    return deletedComponents;
}

function setSnapshotType() {
    if (!firstLoadSent) {
        firstLoadSent = true;
        return "firstLoad"
    }
    return "update"
}
        
function sendRebuild () {
    const snapshotData = getSnapshotData();
    trimDeletedComponents(snapshotData.componentObject);
    
    snapshotData.components.forEach(newComponent => {
        const { tagName, id } = newComponent;
        const component = componentObject[newComponent.id].component;
        const componentState = getComponentState(component);
        
        const previousState = slicer.get('stateHistory')[jumpIndex];
        for (let componentId in previousState) {
            if (JSON.stringify(previousState[componentId]) === JSON.stringify(componentState) && !componentObject.hasOwnProperty(componentId)) {
                slicer.update('componentObject', {component, tagName}, componentId);
                newComponent.id = componentId;
                slicer.delete('componentObject', id);
                const newCount = slicer.getValue('componentCounts', tagName) - 1;
                slicer.update('componentCounts', newCount, tagName);
            }
        }    
    })
                        
    sendSnapshot(snapshotData, 'rebuild');
    resetSnapshotData();
    jumpIndex = undefined;
}

function parseDevToolMessage (event) {
    // Only accept messages from the same frame
    if (event.source !== window) {
        return;
    }
    
    // Only accept messages that we know are ours
    if (typeof event.data !== 'object' || event.data === null ||
      !event.data.source === 'panel.js') {
      return;
    }

    if (event.data.type === 'jumpState') {
        const { index, tree} = event.data;
        jumpIndex = index;
        rebuildDom(tree);
    }

    if (event.data.type === 'clearSnapshots') {
        const { index, path, clearType } = event.data;
        clearSnapshots(index, path, clearType);
    }
}