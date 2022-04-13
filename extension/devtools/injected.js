const listeners = {};
const nodes = new Map();
let node_id = 0;
let firstLoadSent = false;
let stateHistory = [];
const storeVariables = {};
let rebuildingDom = false;
let snapshotLabel = "Init";
let jumpIndex;

let slicer = (() => {
    const variables = {
        components: [],
        deletedNodes: [],
        insertedNodes: [],
        componentCounts: {},
        componentObject: {}
    }

    return {
        get: (variableName) => variables[variableName],
        getValue: (variableName, key) => variables[variableName][key],
        has: (variableName, key) => variables[variableName].hasOwnProperty(key),
        add: (variableName, value) => variables[variableName].push(value),
        reset: (variableName) => variables[variableName].splice(0, variables[variableName].length),
        update: (variableName, newValue, key) => variables[variableName][key] = newValue,
        delete: (variableName, key) => delete variables[variableName][key]
    };
})();

function setup(root) {
    root.addEventListener('SvelteRegisterComponent', registerNewComponent);
    root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
    root.addEventListener('SvelteDOMRemove', svelteDOMRemove);
    root.addEventListener('SvelteDOMAddEventListener', svelteDOMAddEventListener);
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
            storeVariables[variableName] = value;
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
    const nodeData = nodes.get(node);
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
        let id = nodes.get(node);
        if (!id) {
            id = node_id++;
            componentName = getComponentName(node.__svelte_meta.loc.file)
            nodes.set(node, {id, componentName});
        }
        slicer.add('insertedNodes', {
            target: ((nodes.get(target)) ? nodes.get(target).id : target.nodeName + target.id),
            id,
            component: componentName, 
            loc: node.__svelte_meta.loc.char
        });
    }
}

function svelteDOMAddEventListener(e) {
    const { node, event } = e.detail;
    if (node.__svelte_meta) {
        if (!nodes.has(node)) {
            const nodeId = node_id++;
            const componentName = getComponentName(node.__svelte_meta.loc.file)
            nodes.set(node, {nodeId, componentName});
        }
        const nodeData = nodes.get(node);
        const listenerId = nodeData.id + event;
        node.addEventListener(event, () => updateLabel(nodeData.id, event));
        
        listeners[listenerId] = ({
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
    const listener = listeners[nodeId + event];
    const { component, handlerName } = listener;
    snapshotLabel = component + ' - ' + event + " -> " + handlerName;
    rebuildingDom = false;
}

function rebuildDom(tree) {
    rebuildingDom = true;
    const componentObject = slicer.get('componentObject');
    
    tree.forEach(componentFile => {
        for (let componentInstance in componentObject) {
            if (componentObject[componentInstance].tagName === componentFile) {
                if (stateHistory[jumpIndex].hasOwnProperty(componentInstance)) {
                    const variables = stateHistory[jumpIndex][componentInstance];
                    for (let variable in variables) {
                        if (variable[0] === '$') {
                            updateStore(componentInstance, variable, variables[variable]);
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

function updateStore(componentId, name, value) {
    const component = slicer.get('componentObject')[componentId].component;
    const store = storeVariables[name.slice(1)];
    store.set(value);
}

function clearSnapshots(index, path, clearType) {
    if (clearType === 'forward') {
        stateHistory = stateHistory.slice(0, index + 1);
    }
    else if (clearType === 'previous') {
        stateHistory = stateHistory.slice(index);
    }
    else if (clearType === 'path') {
        for (let i = stateHistory.length -1; i > 0 ; i--){
            if (!path.includes(i)){
                stateHistory.splice(i,1);
            }
        }
    }
}

setup(window.document);
                  
for (let i = 0; i < window.frames.length; i++) {
    const frame = window.frames[i]
    const root = frame.document
    setup(root)
}

// observe for changes to the DOM
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
        
// capture initial DOM load as one snapshot
window.onload = () => {
    // make sure that data is being sent
    const components = slicer.get('components');
    const deletedNodes = slicer.get('deletedNodes');
    const insertedNodes = slicer.get('insertedNodes');
    if (components.length || insertedNodes.length || deletedNodes.length) {
        stateHistory.push(deepClone(captureRawAppState()));
        firstLoadSent = true;
        
        window.postMessage({
            source: 'panel.js',
            type: 'firstLoad',
            data: {
                stateObject: captureParsedAppState(),
                components,
                insertedNodes,
                deletedNodes,
                snapshotLabel
            }
        })

        // reset arrays
        slicer.reset('components');
        slicer.reset('deletedNodes');
        slicer.reset('insertedNodes');
        snapshotLabel = undefined;
    }

    // start MutationObserver
    observer.observe(window.document, {attributes: true, childList: true, subtree: true});
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

// capture subsequent DOM changes to update snapshots
window.document.addEventListener('dom-changed', (e) => {
    const components = slicer.get('components');
    const deletedNodes = slicer.get('deletedNodes');
    const insertedNodes = slicer.get('insertedNodes');
    const componentObject = slicer.get('componentObject');
    // only send message if something changed in SvelteDOM or stateObject
    if (components.length || insertedNodes.length || deletedNodes.length) {
        // check for deleted components
        for (let component in componentObject) {
            if (componentObject[component].component.$$.fragment === null) {
                slicer.delete('componentObject', component);
            }
        }
        const currentState = captureRawAppState();
        stateHistory.push(deepClone(currentState));
        let type;
        // make sure the first load has already been sent; if not, this is the first load
        if (!firstLoadSent) {
            type = "firstLoad";
            firstLoadSent = true;
        }
        else type = "update";
        
        window.postMessage({
            source: 'panel.js',
            type,
            data: {
                stateObject: captureParsedAppState(),
                components,
                insertedNodes,
                deletedNodes,
                snapshotLabel
            }
        });
                        
        // reset arrays
        slicer.reset('components');
        slicer.reset('deletedNodes');
        slicer.reset('insertedNodes');
        snapshotLabel = undefined;
    }
});

// clean up after jumps
window.document.addEventListener('rebuild', (e) => {
    const components = slicer.get('components');
    const deleteNodes = slicer.get('deletedNodes');
    const insertedNodes = slicer.get('insertedNodes');
    const componentObject = slicer.get('componentObject');

    deletedComponents = [];
    for (let component in componentObject) {
        if (componentObject[component].component.$$.fragment === null) {
            slicer.delete('componentObject', component);
            deletedComponents.push(component);
        }
    }
    
    components.forEach(newComponent => {
        const { tagName, id } = newComponent;
        const component = componentObject[id].component;
        const captureStateFunc = component.$capture_state;
        let componentState = captureStateFunc ? captureStateFunc() : {}; 
        if (componentState && !Object.keys(componentState).length) {
            if (component.$$.ctx.constructor.name === "Object") {
                componentState = deepClone(component.$$.ctx);
            }
        }
        
        const previousState = stateHistory[jumpIndex];
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
                        
    window.postMessage({
        source: 'panel.js',
        type: 'rebuild',
        data: {
            stateObject: captureParsedAppState(),
            components,
            insertedNodes,
            deletedNodes,
            deletedComponents,
            snapshotLabel
        }
    });

    slicer.reset('components');
    slicer.reset('deletedNodes');
    slicer.reset('insertedNodes');
    snapshotLabel = undefined;
    jumpIndex = undefined;
})

// listen for devTool messages
window.addEventListener('message', function () {
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
})