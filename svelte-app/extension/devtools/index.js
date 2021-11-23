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
                        root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent)
                    }
                  
                    function svelteRegisterComponent (e) {
                        const { tagName, version, id, options } = e.detail;
                        props = options.props;
                        data = {
                            version,
                            id,
                            props,
                            tagName
                        }
                        components.push(data);
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
                        data: components
                    });
                  }  
                  `
            }); 
        })
    }
)
