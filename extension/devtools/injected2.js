class Slicer {
    constructor(window) {
        this.slicer = (() => {
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

        this.setup(window);
    }

    addSvelteDomListeners(root) {
        root.addEventListener('SvelteRegisterComponent', this.registerNewComponent);
    }

    setup(window) {
        this.addSvelteDomListeners(window.document);     
        for (let i = 0; i < window.frames.length; i++) {
            const frame = window.frames[i];
            const root = frame.document;
            this.addSvelteDomListeners(root);
        }
    }

    registerNewComponent(e) {
        console.log(e.detail);
    }

    getComponentName(filePath) {
        if (filePath.indexOf('/') === -1) {
            tagName = filePath.slice((filePath.lastIndexOf('\\\\') + 1), -7);
        }
        else {
            tagName = filePath.slice((filePath.lastIndexOf('/') + 1), -7);
        }
        return tagName;
    }
}

new Slicer(window);

module.exports = Slicer;