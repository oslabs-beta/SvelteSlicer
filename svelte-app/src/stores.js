import { writable } from 'svelte/store';
import { compile } from "svelte/compiler";

export const snapshots = writable([]);

// store counts for component instances
const componentCounts = {};
// store updateable objects for current component state
const componentData = {}
// store ALL nodes and listeners
const nodes = {};
const listeners = {};

// store AST info for each file
const astArray = [];

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

	if (type === "firstLoad") {
		const snapshot = buildFirstSnapshot(data);
		snapshots.update(array => [...array, snapshot]);
	}
	else if (type === "update") {
		console.log(data);
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
	const { components, insertedNodes, addedEventListeners, deletedEventListeners } = data;
	
	// build nodes object
	insertedNodes.forEach(node => {
		nodes[node.id] = {
			children: [],
			id: node.id,
			component: node.component, 
			target: node.target,
			loc: node.loc,
			listeners: {}
		}
		// add as a child to target node
		if (node.target !== "body") {
			nodes[node.target].children.push({id: node.id});
		}
	})

	// build listeners object and assign listeners to nodes
	addedEventListeners.forEach(listener => {
		const listenerData = {
			node: listener.node,
			event: listener.event,
			name: listener.handlerName,
			string: listener.handlerString,
			component: listener.component,
			id: listener.id
		}
		// assign to listenerData object
		listeners[listener.id] = listenerData;

		// assign by reference to associated node in nodes
		nodes[listener.node].listeners[listener.id] = listeners[listener.id];
	});

	// build components and assign nodes, variables and listeners
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
			nodes: {},
			listeners: {}
		};

		const targets = [];
		// create object with all associated nodes
		const nodeLocations = {}; // store nodes by code location and parent to ensure they get assigned to correct component
		insertedNodes.forEach((node, i) => {
			// make sure node belongs to this component - component name should match, should be only node in component from that location OR if same location, must share a target
			if (node.component === tagName && (!nodeLocations.hasOwnProperty(node.loc) || nodeLocations[node.loc] === node.target)) {
				// update node component to include full component id with instance number
				nodes[node.id].component = id;
				// assign node by reference to component data
				data.nodes[node.id] = nodes[node.id];
				// mark the node location as taken for this component and store target node
				nodeLocations[node.loc] = node.target;
				// remove node from insertedNodes array so it can't be assigned to another component
				delete insertedNodes[i];
				// push node target to targetArray for later reference
				targets.push(node.target);
			}
		})

		// identify the target node for the component
		const parentNode = (targets.includes("body")) ? "body" : Math.min(...targets);
		data.parentNode = parentNode;
		data.targets = targets;

		addedEventListeners.forEach(listener => {
			if (data.nodes.hasOwnProperty(listener.node)) {
				// update listener object to include full component id with instance number
				listeners[listener.id].component = id;
				// assign by reference to component 
				data.listeners[listener.id] = listeners[listener.id];
			}
		})

		componentData[id] = data;
	});

	// determine and assign the parent component
	for (let component in componentData) {
		const { parentNode } = componentData[component];
		componentData[component].parent = (parentNode === "body") ? "App" : ((nodes.hasOwnProperty(parentNode)) ? nodes[parentNode].component : null);
	}

	const snapshot = JSON.parse(JSON.stringify(componentData)) // deep copy to "freeze" state

	console.log('First snapshot');
	console.log(snapshot);

	return snapshot;
}

function buildNewSnapshot(data) {
	const { components, insertedNodes, deletedNodes, addedEventListeners, deletedEventListeners } = data;

	// delete event listeners
	deletedEventListeners.forEach(listener => {
		const { component } = listeners[listener.id];
		delete componentData[component].listeners[listener.id];
		delete componentData[component].nodes[listener.node].listeners[listener.id];
	})

	// delete nodes and descendents
	deletedNodes.forEach(node => {
		deleteNode(node.id);
	})

	insertedNodes.forEach(node => {
		nodes[node.id] = {
			children: [],
			id: node.id,
			component: node.component, 
			target: node.target,
			loc: node.loc,
			listeners: {}
		}
		// add as a child to target node
		if (node.target !== "body") {
			nodes[node.target].children.push({id: node.id});
		}
	})

	// build listeners object and assign listeners to nodes
	addedEventListeners.forEach(listener => {
		const listenerData = {
			node: listener.node,
			event: listener.event,
			name: listener.handlerName,
			string: listener.handlerString,
			component: listener.component,
			id: listener.id
		}
		// assign to listenerData object
		listeners[listener.id] = listenerData;

		console.log(nodes[listener.node].listeners);
		// assign by reference to associated node in nodes
		nodes[listener.node].listeners[listener.id] = listeners[listener.id];
	});

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
			nodes: {},
			listeners: {}
		};
		
		/*// create object with all associated nodes
		const targets = [];
		const nodeLocations = {}; // store nodes by code location and parent to ensure they get assigned to correct component
		insertedNodes.forEach((node, i) => {
		// make sure node belongs to this component - component name should match, should be only node in component from that location OR if same location, must share a target
			if (node.component === tagName && (!nodeLocations.hasOwnProperty(node.loc) || nodeLocations[node.loc] === node.target)) {
				// update node component to include full component id with instance number
				nodes[node.id].component = id;
				// assign node by reference to component data
				data.nodes[node.id] = nodes[node.id];
				// mark the node location as taken for this component and store target node
				nodeLocations[node.loc] = node.target;
				// remove node from insertedNodes array so it can't be assigned to another component
				delete insertedNodes[i];
				// push node target to targetArray for later reference
				targets.push(node.target);
			}
		})

		// identify the target node for the component
		const parentNode = (targets.includes("body")) ? "body" : Math.min(...targets);
		data.parentNode = parentNode;
		data.targets = targets;

		componentData[id] = data;
	})

	// determine and assign parents for new components
	components.forEach(component => {
		const { parentNode } = component;
		componentData[component].parent = (parentNode === "body") ? "App" : nodes[parentNode].component;
	})

	// assign any remaining inserted Nodes that didn't go to new components
	insertedNodes.forEach(node => {
		// loop through components in case there are multiple instances
		for (let [component, data] in componentData) {
			if (data.tagName === node.component && data.targets.includes(node.target)) {
				// update node component to include full component id with instance number
				nodes[node.id].component = data.id;
				// assign node by reference to component data
				data.nodes[node.id] = nodes[node.id];
				// push node target to targetArray for later reference
				data.targets.push(node.target);
			}
		}
		*/
	})

	const newSnapshot = JSON.parse(JSON.stringify(componentData))

	console.log('Updated State');
	console.log(newSnapshot);

	return newSnapshot;

	// recursively delete node and all descendents
	function deleteNode (nodeId) {
		const { children, component, id } = nodes[nodeId];
		if (children.length) {
			children.forEach(child => {
				deleteNode(child.id);
			})
		}
		delete componentData[component].nodes[id];
	}
}