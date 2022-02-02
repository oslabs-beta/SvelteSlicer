chrome.devtools.panels.create(
    "Slicer",
    "svelte_logo.png",
    "devtools/panel.html",
    function (panel) {
        panel.onShown.addListener(() => {
            chrome.devtools.inspectedWindow.reload(
                {injectedScript:
                    `
                    const components = [];
                    const deletedNodes = [];
                    const insertedNodes = [];
                    const listeners = {};
                    const nodes = new Map();
                    const componentCounts = {};
                    const componentObject = {};
                    let node_id = 0;
                    let firstLoadSent = false;
                    let stateHistory = [];
                    const storeVariables = {};
                    let rebuildingDom = false;
                    let snapshotLabel = "Init";
                    let jumpIndex;

                    function setup(root) {
                        root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent);
                        root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
                        root.addEventListener('SvelteDOMRemove', svelteDOMRemove);
                        root.addEventListener('SvelteDOMAddEventListener', svelteDOMAddEventListener);
                    }
                  
                    function svelteRegisterComponent (e) {                       
                        const { component, tagName, options } = e.detail;
                        // assign sequential instance value
		                let instance = 0;
		                if (componentCounts.hasOwnProperty(tagName)) {
			                instance = ++componentCounts[tagName];
		                }
		                componentCounts[tagName] = instance;
                        const id = tagName + instance;

                        componentObject[id] = {component, tagName};

                        data = {
                            id,
                            state: captureComponentState(component),
                            tagName,
                            instance,
                            target: (options.target) ? options.target.nodeName + options.target.id : null
                        }
                        components.push(data);
                    }

                    function parseState(element, name = null) {
                        if (element === null) {
                            return { 
                                value: element,
                                name
                            };
                        }
                        else if (typeof element === "function") {
                            return {
                                name,
                                value: element.toString()
                            };
                        }
                        else if (typeof element === "object") {
                            if (element.constructor) {
                                if (element.constructor.name === "Object" || element.constructor.name === "Array") {
                                    const value = {};
                                    for (let i in element) {
                                        value[i] = parseState(element[i], i);
                                    }
                                    return {value, name};
                                }
                                else {
                                    return {
                                        name,
                                        value: element.constructor.name
                                    }
                                }
                            }
                            else {
                                return {
                                    name,
                                    value: "Unknown Object"
                                }
                            }
                        }
                        else {
                            return {
                                value: element,
                                name
                            };
                        }
                    }

                    function captureComponentState(component) {
                        const captureStateFunc = component.$capture_state;
                        let state = captureStateFunc ? captureStateFunc() : {};
                        // if capture_state produces an empty object, may need to use ctx instead (older version of Svelte)
                        if (state && !Object.keys(state).length) {
                            if (component.$$.ctx.constructor.name === "Object") {
                                state = deepClone(component.$$.ctx);
                            }
                        }
                    
                        const parsedState = {};
                        for (let variable in state) {
                            if (typeof state[variable] === "function") {
                                delete state[variable];
                            }
                            else if (state[variable] === null) {
                                parsedState[variable] = parseState(state[variable], variable);
                            }
                            else if (typeof state[variable] === "object") {
                                if (state[variable].constructor) {
                                    if (state[variable].constructor.name === "Object" || state[variable].constructor.name === "Array") {
                                        // check if variable is a store variable
                                        if (state[variable].hasOwnProperty('subscribe')) {
                                            // if a writable store, we need to store the instance
                                            if (state[variable].hasOwnProperty('set') && state[variable].hasOwnProperty('update')) {
                                                storeVariables[variable] = state[variable];
                                            }
                                            delete state[variable];
                                        }
                                        else {
                                            parsedState[variable] = parseState(state[variable], variable);
                                        }
                                    }
                                    // we can't handle any object that's not a "true" object or array, so delete from state
                                    else {
                                        delete state[variable];
                                    }
                                }
                                else {
                                    delete state[variable];
                                }
                            }
                            else {
                                parsedState[variable]  = parseState(state[variable], variable);
                            }
                        }
                        return parsedState;
                    }

                    function svelteDOMRemove(e) {
                        
                        const { node } = e.detail;
                        const nodeData = nodes.get(node);
                        if (nodeData) {
                            deletedNodes.push({
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
                            insertedNodes.push({
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
                        const component = componentObject[componentId].component;
                        component.$inject_state({ [key]: value })
                    }

                    function updateStore(componentId, name, value) {
                        const component = componentObject[componentId].component;
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
                            components.splice(0, components.length);
                            insertedNodes.splice(0, insertedNodes.length);
                            deletedNodes.splice(0, deletedNodes.length);
                            snapshotLabel = undefined;
                        }

                        // start MutationObserver
                        observer.observe(window.document, {attributes: true, childList: true, subtree: true});
                    }   

                    function captureRawAppState() {
                        const appState = {};
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
                        for (let component in componentObject) {
                            appState[component] = captureComponentState(componentObject[component].component);
                        }
                        return appState;
                    }

                    // capture subsequent DOM changes to update snapshots
                    window.document.addEventListener('dom-changed', (e) => {
                        // only send message if something changed in SvelteDOM or stateObject
                        const currentState = captureRawAppState();
                        const stateChange = JSON.stringify(currentState) !== JSON.stringify(stateHistory[stateHistory.length -1]);
                        if (components.length || insertedNodes.length || deletedNodes.length) {
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
                            components.splice(0, components.length);
                            insertedNodes.splice(0, insertedNodes.length);
                            deletedNodes.splice(0, deletedNodes.length);
                            snapshotLabel = undefined;
                        }
                    });

                    // clean up after jumps
                    window.document.addEventListener('rebuild', (e) => {
                        deletedComponents = [];
                        for (let component in componentObject) {
                            if (componentObject[component].component.$$.fragment === null) {
                                delete componentObject[component];
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
                                    componentObject[componentId] = {
                                        component,
                                        tagName
                                    }
                                    newComponent.id = componentId;
                                    delete componentObject[id]
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

                        components.splice(0, components.length);
                        insertedNodes.splice(0, insertedNodes.length);
                        deletedNodes.splice(0, deletedNodes.length);
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
                    `
                }
            ); 
        })
    }
)