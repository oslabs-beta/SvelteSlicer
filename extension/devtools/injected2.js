let slicer = (() => {
    const variables = {
        components: [],
        deletedNodes: [],
        insertedNodes: [],
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

function addSvelteDomListeners(root) {
    root.addEventListener('SvelteRegisterComponent', registerNewComponent);
}

function setup(window) {
    addSvelteDomListeners(window.document);     
    for (let i = 0; i < window.frames.length; i++) {
        const frame = window.frames[i];
        const root = frame.document;
        this.addSvelteDomListeners(root);
    }
}

function registerNewComponent(e) {
    console.log(e.detail);
}

function getComponentName(filePath) {
    if (filePath.indexOf('/') === -1) {
        tagName = filePath.slice((filePath.lastIndexOf('\\\\') + 1), -7);
    }
    else {
        tagName = filePath.slice((filePath.lastIndexOf('/') + 1), -7);
    }
    return tagName;
}