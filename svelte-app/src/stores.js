import { writable, get } from 'svelte/store';
import { compile } from "svelte/compiler";

export const snapshots = writable([]);

// store counts for component instances
const componentCounts = {};

// store AST info for each file
const astArray = [];
const nodeChildren = {};

// set up background page Connection
var backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

// Listen for SvelteDOM messages from content script
chrome.runtime.onMessage.addListener((msg) => {
    const parsedMessage = JSON.parse(msg);

	const { data, type } = parsedMessage;

	console.log(data);

	if (type === "firstLoad") {
		const snapshot = buildFirstSnapshot(data);
		snapshots.update(array => [...array, snapshot]);
	}
	else if (type === "update") {
		const newSnapshot = buildNewSnapshot(data);
		snapshots.update(array => [...array, newSnapshot]);
	}
	else if (type === "event") {
		//do something
	}
});

chrome.devtools.inspectedWindow.getResources(resources => {
	const arrSvelteFiles = resources.filter(file =>file.url.includes(".svelte"));
	arrSvelteFiles.forEach(svelteFile => {
	  	svelteFile.getContent(source => {
			if (source) {
				const { ast } = compile(source);
				astArray.push({file: svelteFile.url, ast: ast});
		}
	  });
	});
});

function buildFirstSnapshot(data) {
	const { components, insertedNodes, deletedNodes, addedEventListeners, deletedEventListeners } = data;

	insertedNodes.forEach(node => {
		nodeChildren[node.id] = [];
		if (node.target !== "body") {
			nodeChildren[node.target].push(node.id);
		}
	})

	const componentData = {};

	components.forEach(component => {
		const { ctx, injectState, captureState, tagName } = component;
		
		// assign sequential instance value
		let instance = 0;
		if (componentCounts.hasOwnProperty(tagName)) {
			instance = ++componentCounts[tagName];
		}
		componentCounts[tagName] = instance;

		// create object with all associated variables
		const variables = {};
		captureState.forEach(variable => {
			const varObj = {
				name: variable
			}

			for (let variableName in injectState) {
				if (variableName === variable) {
					varObj.index = injectState[variableName];
					varObj.value = ctx[injectState[variableName]].value;
				}
			}
			variables[variable] = varObj;
		})

		// create object with all associated nodes
		const nodes = {};
		const nodeLocations = {};
		insertedNodes.forEach((node, i) => {
			// make sure node belongs to this component
			if (node.component === tagName && !nodeLocations.hasOwnProperty(node.loc)) {
				const listeners = {};
				addedEventListeners.forEach(listener => {
					if (listener.node === node.id) {
						listeners[listener.event] = {
							node: node.id,
							event: listener.event,
							name: listener.handlerName,
							string: listener.handlerString,
							component: listener.component
						}
					}
				})

				nodes[node.id] = {
					id: node.id,
					component: component.tagName,
					target: node.target,
					children: nodeChildren[node.id],
					listeners
				};
				// mark the node location as taken for this component
				nodeLocations[node.loc] = true;
				// remove node from array so it can't be assigned to another component
				insertedNodes.splice(i, 1);
			}
		})

		const id = tagName + instance;

		const data = {
			tagName,
			instance,
			id,
			variables,
			nodes
		};

		componentData[id] = data;
	});

	const snapshot = componentData;

	console.log('First snapshot:');
	console.log(snapshot);

	return snapshot;
}

function buildNewSnapshot(data) {
	const { components, insertedNodes, deletedNodes, addedEventListeners, deletedEventListeners } = data;
	const snaps = get(snapshots);
	const snapshot = snaps[snaps.length - 1];

	// delete event listeners
	deletedEventListeners.forEach(listener => {
		// loops through components in case there are multiple instances
		for (let component in snapshot) {
			if (snapshot[component].nodes.hasOwnProperty(listener.node)) {
				delete (snapshot[component].nodes[listener.node].listeners[listener.event]);
			}
		}
	})

	// delete nodes and descendents
	deletedNodes.forEach(node => {
		// loops through components in case there are multiple instances
		for (let component in snapshot) {
			if (snapshot[component].nodes.hasOwnProperty(node.id)) {
				deleteNode(snapshot[component].nodes[node.id], component);
			}
		}
	})

	// add new components
	components.forEach(component => {
		const { ctx, injectState, captureState, tagName } = component;
		
		// assign sequential instance value
		let instance = 0;
		if (componentCounts.hasOwnProperty(tagName)) {
			instance = ++componentCounts[tagName];
		}
		componentCounts[tagName] = instance;

		// create object with all associated variables
		const variables = {};
		captureState.forEach(variable => {
			const varObj = {
				name: variable
			}

			for (let variableName in injectState) {
				if (variableName === variable) {
					varObj.index = injectState[variableName];
					varObj.value = ctx[injectState[variableName]].value;
				}
			}
			variables[variable] = varObj;
		})

		const id = tagName + instance;

		const data = {
			tagName,
			instance,
			id,
			variables,
			nodes: {}
		};

		snapshot[id] = data;
	});

	// add new nodes to children mapping
	insertedNodes.forEach(node => {
		nodeChildren[node.id] = [];
		if (node.target !== "body") {
			nodeChildren[node.target].push(node.id);
		}
	})

	insertedNodes.forEach(node => {
		const nodeData = {
			component: node.component,
			target: node.target,
			children: nodeChildren[node.id],
			listeners: {}
		};
		snapshot[node.component].nodes[node.id] = nodeData;
	});

	addedEventListeners.forEach(listener => {
		const listenerData = {
			node: listener.node,
			event: listener.event,
			name: listener.handlerName,
			string: listener.handlerString,
			component: listener.component
		};
		for (let component in snapshot) {
			if (snapshot[component].nodes.hasOwnProperty(node.id)) {
				snapshot[component].nodes[listener.node].listeners[listener.event] = listenerData;
			}
		}
	})

	console.log("Updated snapshot");
	console.log(snapshot);
	return snapshot;

	// recursively delete node and all descendents
	function deleteNode (nodeData, component) {
		if (nodeData.children.length) {
			nodeData.children.forEach(child => {
				deleteNode(snapshot[component].nodes[child], component)
			})
		}
		delete snapshot[component].nodes[nodeData.id];
	}
}