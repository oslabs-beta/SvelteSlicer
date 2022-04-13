const Slicer = require('../extension/devtools/injected2.js');

describe('getComponentName', () => {
    test('it should return a tagname given a valid Svelte file path', () => {
        const filePath = 'src/App.svelte';
        const expectedResult = 'App';
        expect(Slicer.getComponentName(filePath)).toBe(expectedResult);
    })
})
