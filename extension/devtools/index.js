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
                    const deletedEventListeners = [];
                    const nodes = new Map();
                    let node_id = 0;
        
                    function setup(root) {
                        root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent);
                        root.addEventListener('SvelteRegisterBlock', svelteRegisterBlock);
                        root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
                        root.addEventListener('SvelteDOMRemove', svelteDOMRemove);
                        root.addEventListener('SvelteDOMAddEventListener', svelteDOMAddEventListener);
                        root.addEventListener('SvelteDOMRemoveEventListener', svelteDOMRemoveEventListener);
                    }
                  
                    function svelteRegisterComponent (e) {                        
                        console.log("RegisterComponent");
                        console.log(e.detail);

                        const { component, tagName } = e.detail;
                                                
                        // get state variables and ctx indices from $inject_state
                        const injectState = {};
                        let string = component.$inject_state.toString();
                        while (string.includes('$$invalidate')) {
                            const varIndexStart = string.indexOf('$$invalidate') + 13;
                            const varIndexEnd = string.indexOf(',', varIndexStart);
                            const varIndex = (string.slice(varIndexStart, varIndexEnd));
                            
                            const varNameStart = varIndexEnd + 1;
                            const varNameEnd = string.indexOf('=', varNameStart);
                            const varName = string.slice(varNameStart, varNameEnd).trim();

                            injectState[varName] = varIndex;

                            string = string.slice(varNameEnd);
                        }

                        // change function definitions into strings
                        const ctx = {};
                        component.$$.ctx.forEach((element, index) => {
                            if (typeof element === "function") {
                                ctx[index] = {type: 'function', name: element.name, string: element.toString()};
                            }
                            else if (typeof element === "object") {
                                ctx[index] = {type: 'object'};
                            }
                            else {
                                ctx[index] = {type: 'value', value: element};
                            }
                        })

                        // parse out elements of $capture_state
                        const captureStateString = component.$capture_state.toString().slice(8, -2);
                        const captureState = captureStateString.split(',').map(string => string.trim());

                        data = {
                            ctx,
                            injectState,
                            tagName,
                            captureState
                        }
                        components.push(data);
                    }
                  
                    function svelteRegisterBlock(e) {
                        console.log("RegisterBlock");
                        console.log(e.detail);
                    }

                    function svelteDOMRemove(e) {
                        console.log("DOMRemove");
                        console.log(e.detail);
                        
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
                        console.log("DOMInsert");
                        console.log(e.detail);
                        
                        const { node, target } = e.detail;
                        if (node.__svelte_meta) {
                            let id = nodes.get(node);
                            if (!id) {
                                id = node_id++;
                                componentName = getComponentName(node.__svelte_meta.loc.file)
                                nodes.set(node, {id, componentName});
                            }
                            insertedNodes.push({
                                target: (target.nodeName === "BODY") ? "body" : nodes.get(target).id,
                                id,
                                component: componentName, 
                                loc: node.__svelte_meta.loc.char
                            });
                        }
                    }

                    function svelteDOMAddEventListener(e) {
                        console.log("DOMAddEventListener");
                        console.log(e.detail);

                        const { node, event } = e.detail;
                        const nodeData = nodes.get(node);

                        node.addEventListener(event, () => eventAlert(nodeData.id, event));
                            
                        addedEventListeners.push({
                            node: nodeData.id,
                            event,
                            handlerName: e.detail.handler.name,
                            handlerString: e.detail.handler.toString(),
                            component: nodeData.component,
                            id: nodeData.id + event
                        })
                    }

                    function svelteDOMRemoveEventListener(e) {
                        console.log("DOMRemoveEventListener");
                        console.log(e.detail);

                        const { node, event } = e.detail;
                        nodeData = nodes.get(node);

                        node.removeEventListener(event, () => eventAlert(nodeData.id, event));
                        
                        deletedEventListeners.push({
                            node: nodeData.id,
                            event: event,
                            component: nodeData.component,
                            id: nodeData.id + event
                        })
                    }

                    function getComponentName(file) {
                        return file.slice((file.lastIndexOf('/') + 1), -7);
                    }

                    function eventAlert(nodeId, event) {
                        window.postMessage({
                            source: 'panel.js',
                            type: 'event',
                            data: {
                                nodeId,
                                event
                            }
                        });
                    }

                    setup(window.document);
                  
                    for (let i = 0; i < window.frames.length; i++) {
                        const frame = window.frames[i]
                        const root = frame.document
                        setup(root)
                    }

                    // observe for changes to the DOM
                    const observer = new MutationObserver( list => {
                        const evt = new CustomEvent('dom-changed', {detail: list});
                        window.document.dispatchEvent(evt)
                    });
        
                    // capture initial DOM load as one snapshot
                    window.onload = () => {
                        window.postMessage({
                            source: 'panel.js',
                            type: 'firstLoad',
                            data: {
                                components,
                                insertedNodes,
                                deletedNodes,
                                addedEventListeners,
                                deletedEventListeners
                            }
                        });

                        // reset arrays
                        components.splice(0, components.length);
                        insertedNodes.splice(0, insertedNodes.length);
                        deletedNodes.splice(0, deletedNodes.length);
                        addedEventListeners.splice(0, addedEventListeners.length);
                        deletedEventListeners.splice(0, deletedEventListeners.length);

                        // start MutationObserver
                        observer.observe(window.document, {attributes: true, childList: true, subtree: true});
                    }   

                    // capture subsequent DOM changes to update snapshots
                    window.document.addEventListener('dom-changed', (e) => {
                        // only send message if something changed in SvelteDOM
                        if (components.length || insertedNodes.length || deletedNodes.length || addedEventListeners.length || deletedEventListeners.length) {
                            window.postMessage({
                                source: 'panel.js',
                                type: 'update',
                                data: {
                                    components,
                                    insertedNodes,
                                    deletedNodes,
                                    addedEventListeners,
                                    deletedEventListeners
                                }
                            });
                        }

                        // reset arrays
                        components.splice(0, components.length);
                        insertedNodes.splice(0, insertedNodes.length);
                        deletedNodes.splice(0, deletedNodes.length);
                        addedEventListeners.splice(0, addedEventListeners.length);
                        deletedEventListeners.splice(0, deletedEventListeners.length);
                    });
                    `
                }
            ); 
        })
    }
)
