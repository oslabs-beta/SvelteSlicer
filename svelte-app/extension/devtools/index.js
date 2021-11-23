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
                    const blocks = [];
        
                    function setup(root) {
                        root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent);
                        root.addEventListener('SvelteDOMSetAttribute', svelteDOMSetAttribute);
                        root.addEventListener('SvelteDOMInsert', svelteDOMInsert);
                    }
                  
                    function svelteRegisterComponent (e) {
                        const { tagName, version, id, component } = e.detail;
                        
                        console.log(component.$$)
                        const ctxObj = {};
                        component.$$.ctx.forEach((element, index) => {
                            if (typeof element !== "function") {
                                ctxObj[index] = element;
                            }
                        })

                        const stateArray = [];
                        let stateString = component.$capture_state.toString().slice(8, -2);
                        stateString = stateString.replace(/\\n|\\t\\t/g, ""); 
                        const tempArray = stateString.split(', ');
                        tempArray.forEach(string => {
                            stateArray.push(string.trim());
                        })

                        data = {
                            version,
                            id,
                            props: component.$$.props,
                            ctx: ctxObj,
                            tagName,
                            state: stateArray
                        }
                        components.push(data);
                    }
                  
                    function svelteDOMSetAttribute(e) {
                        console.log(e.detail);
                    }

                    function svelteDOMInsert(e) {
                        console.log(e.detail)
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
                            type: 'components',
                            data: components
                        });
                        
                    }  
                    `
                }
            ); 
        })
    }
)
