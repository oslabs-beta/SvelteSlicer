import { writable } from 'svelte/store';

export const components = writable([]);

var backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

chrome.runtime.onMessage.addListener((msg) => {
    const parsedMessage = JSON.parse(msg);

	const {data, type } = parsedMessage;

	if (type === 'component') {
		if (data && Array.isArray(data)) {
			data.forEach(component => {
				components.update(o => (o.push(component), o));
			})
		}
	}
});