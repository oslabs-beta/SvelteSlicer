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
                    const addedEventListeners = [];
                    const nodes = new Map();
                    const componentCounts = {};
                    const componentObject = {};
                    let node_id = 0;
                    let firstLoadSent = false;
                    let stateHistory = [];
                    const storeVariables = {};
                    let rebuildingDom = false;

                    function setup(root) {
                        root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent);
                        root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
                        root.addEventListener('SvelteDOMRemove', svelteDOMRemove);
                        root.addEventListener('SvelteDOMAddEventListener', svelteDOMAddEventListener);
                        root.addEventListener('SvelteDOMRemoveEventListener', svelteDOMRemoveEventListener);
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
                            }
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
                                state = JSON.parse(JSON.stringify(component.$$.ctx));
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
                                        if (state[variable].hasOwnProperty('subscribe')) {
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
                        const { node, event, handler } = e.detail;
                        const nodeData = nodes.get(node);

                        id = nodeData.id + event;

                        node.addEventListener(event, () => eventAlert(nodeData.id, event));
                            
                        addedEventListeners.push({
                            node: nodeData.id,
                            event,
                            handlerName: e.detail.handler.name,
                            handlerString: e.detail.handler.toString(),
                            component: nodeData.component,
                            id
                        })
                    }

                    function svelteDOMRemoveEventListener(e) {
                        const { node, event } = e.detail;
                        nodeData = nodes.get(node);
                        const id = nodeData.id + event;

                        node.removeEventListener(event, () => eventAlert(nodeData.id, event));                      
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

                    function parseCtxObject() {
                        parsedCtx = {};
                        for (let component in ctxObject) {
                            const ctxData = {};
                            ctxObject[component].ctx.forEach((element, index) => {
                                ctxData[index] = parseCtx(element);
                            })
                            parsedCtx[component] = ctxData;
                        }
                        return parsedCtx;
                    }

                    function eventAlert(nodeId, event) {
                        rebuildingDom = false;
                        window.postMessage({
                            source: 'panel.js',
                            type: 'event',
                            data: {
                                nodeId,
                                event
                            }
                        });
                    }

                    function rebuildDom(index, state, tree) {
                        rebuildingDom = true;
                        
                        tree.forEach(componentFile => {
                            for (let componentInstance in stateHistory[stateHistory.length - 1]) {
                                if (componentObject[componentInstance].tagName === componentFile) {
                                    if (stateHistory[index].hasOwnProperty(componentInstance)) {
                                        const variables = stateHistory[index][componentInstance];
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
                        if (components.length || insertedNodes.length || deletedNodes.length || addedEventListeners.length) {
                            stateHistory.push(JSON.parse(JSON.stringify(captureRawAppState())));
                            firstLoadSent = true;
                            
                            window.postMessage({
                                source: 'panel.js',
                                type: 'firstLoad',
                                data: {
                                    stateObject: captureParsedAppState(),
                                    components,
                                    insertedNodes,
                                    deletedNodes,
                                    addedEventListeners,
                                }
                            })
                        }

                        // reset arrays
                        components.splice(0, components.length);
                        insertedNodes.splice(0, insertedNodes.length);
                        deletedNodes.splice(0, deletedNodes.length);
                        addedEventListeners.splice(0, addedEventListeners.length);

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
                            stateHistory.push(JSON.parse(JSON.stringify(currentState)));
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
                                    addedEventListeners,
                                }
                            });
                        }
                        
                        // reset arrays
                        components.splice(0, components.length);
                        insertedNodes.splice(0, insertedNodes.length);
                        deletedNodes.splice(0, deletedNodes.length);
                        addedEventListeners.splice(0, addedEventListeners.length);
                    });

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
                            const { index, state, tree} = event.data;
                            rebuildDom(index, state, tree);
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