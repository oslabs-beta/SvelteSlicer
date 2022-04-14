/**
 * @jest-environment jsdom
 */

const rewire = require('rewire');
const injected = rewire('../extension/devtools/injected.js');

describe('getComponentName', () => {
  test('it should return a tagname given a valid Svelte file path', () => {
    const filePath = 'src/App.svelte';
    const expectedResult = 'App';
    const getComponentName = injected.__get__('getComponentName');
    expect(getComponentName(filePath)).toBe(expectedResult);
  });
});

describe('addSvelteDomListeners', () => {
  test('it should call correct function when given custom event is fired', () => {
    const addSvelteDomListeners = injected.__get__('addSvelteDomListeners');
    const registerNewComponentMock = jest.fn();
    injected.__set__('registerNewComponent', registerNewComponentMock);
    addSvelteDomListeners(window.document);
    // dispatch click event to listener
    const addEvt = new Event('SvelteRegisterComponent');
    document.dispatchEvent(addEvt);
    expect(registerNewComponentMock).toHaveBeenCalledTimes(1);
  });
});
