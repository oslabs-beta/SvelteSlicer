const rewire = require('rewire');
const injected = rewire('../extension/devtools/injected2.js');

describe('getComponentName', () => {
    test('it should return a tagname given a valid Svelte file path', () => {
        const filePath = 'src/App.svelte';
        const expectedResult = 'App';
        const getComponentName = injected.__get__('getComponentName');
        expect(getComponentName(filePath)).toBe(expectedResult);
    })
})
