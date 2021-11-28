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
        
                    function setup(root) {
                        root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent);
                        root.addEventListener('SvelteRegisterBlock', svelteRegisterBlock);
                        root.addEventListener('SvelteDOMSetData', svelteDOMSetData);
                        root.addEventListener('SvelteDOMSetAttribute', svelteDOMSetAttribute);
                        root.addEventListener('SvelteDOMSetProperty', svelteDOMSetProperty)
                        root.addEventListener('SvelteDOMRemoveAttribute', svelteDOMRemoveAttribute)
                        root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
                        root.addEventListener('SvelteDOMRemove', svelteDOMRemove);
                        root.addEventListener('SvelteDOMAddEventListener', svelteDOMAddEventListener);
                        root.addEventListener('SvelteDOMRemoveEventListener', svelteDOMRemoveEventListener);
                    }
                  
                    function svelteRegisterComponent (e) {                        
                        const { tagName, version, id, component } = e.detail;

                        // grab instance variables that are not function definitions
                        const ctx = {};
                        component.$$.ctx.forEach((element, index) => {
                            if (typeof element !== "function") {
                                ctx[index] = element;
                            } else {
                                ctx[index] = element.name;
                            }
                        })

                        // parse out elements of $capture_state
                        const stateString = component.$capture_state.toString().slice(8, -2);
                        const stateArray = stateString.split(',').map(string => string.trim());

                        data = {
                            version,
                            id,
                            ctx,
                            props: component.$$.props,
                            state: stateArray,
                            tagName
                        }
                        components.push(data);
                    }
                  
                    function svelteRegisterBlock(e) {
                        console.log("RegisterBlock");
                        console.log(e);
                    }

                    function svelteDOMSetData(e) {
                        console.log("DOMSetData");
                        console.log(e);
                    }
                    
                    function svelteDOMSetAttribute(e) {
                        console.log("DOMSetAttribute");
                        console.log(e);
                    }

                    function svelteDOMSetProperty(e) {
                        console.log("DOMSetProperty");
                        console.log(e);
                    }

                    function svelteDOMRemoveAttribute(e) {
                        console.log("DOMRemoveAttribute");
                        console.log(e);
                    }

                    function svelteDOMRemove(e) {
                        console.log("DOMRemove");
                        console.log(e);
                    }

                    function svelteDOMInsert(e) {
                        console.log("DOMInsert");
                        console.log(e);
                    }

                    function svelteDOMAddEventListener(e) {
                        console.log("DOMAddEventListener");
                        console.log(e);
                    }

                    function svelteDOMRemoveEventListener(e) {
                        console.log("DOMRemoveEventListener");
                        console.log(e);
                    }

                    setup(window.document);
                  
                    for (let i = 0; i < window.frames.length; i++) {
                        const frame = window.frames[i]
                        const root = frame.document
                        setup(root)
                    }
        
                    window.onload = () => {
                        window.postMessage({
                            source: 'panel.js',
                            type: 'component',
                            data: components
                        });
                        components.splice(0, components.length);
                    }   
                    `
                }
            ); 
        })
    }
)
