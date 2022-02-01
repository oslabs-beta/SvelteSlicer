import { writable, get } from 'svelte/store';
import { compile } from "svelte/compiler";
import _ from "lodash";

export const snapshots = writable([]);
export const fileTree = writable({});
export const flatFileTree = writable([]);
export const backgroundPageConnection = writable(chrome.runtime.connect({name: "panel"}));

// store updateable objects for current component state
let componentData = {}
// store ALL nodes and listeners
const nodes = {};
const listeners = {};

// store AST info for each file
const astInfo = {};
const componentTree = {};
let parentComponent;
let domParent;
let snapshotLabel = "Init";

// set up background page Connection
const connection = get(backgroundPageConnection);

connection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

// Listen for SvelteDOM messages from content script
chrome.runtime.onMessage.addListener((msg) => {
    const parsedMessage = JSON.parse(msg);

	const { data, type } = parsedMessage;

	if (type === "firstLoad") {
		snapshots.set([]);
		const snapshot = buildSnapshot(data);
		snapshots.update(array => [...array, snapshot]);
	}
	else if (type === "update") {
		const newSnapshot = buildSnapshot(data);
		snapshots.update(array => [...array, newSnapshot]);
	}
	else if (type === "event") {
		const listener = listeners[data.nodeId + data.event];
		const { component, event, name } = listener;
		const tagName = componentData[component].tagName
		snapshotLabel = tagName + ' - ' + event + " -> " + name;
	}
});

// get and parse through the AST for additional variable info
chrome.devtools.inspectedWindow.getResources(resources => {
	const arrSvelteFiles = resources.filter(file =>file.url.includes(".svelte"));
	arrSvelteFiles.forEach(svelteFile => {
	  	svelteFile.getContent(source => {
			if (source) {
				const { ast } = compile(source);
				const componentName = svelteFile.url.slice((svelteFile.url.lastIndexOf('/') + 1), svelteFile.url.lastIndexOf('.svelte'));			
				const components = {};
				if (ast.instance) {
					const astVariables = ast.instance.content.body;
					const data = {};
					astVariables.forEach(variable => {
						if (variable.type === "ImportDeclaration" && variable.source.value.includes('.svelte')) {
							data.name = variable.specifiers[0].local.name;
							data.parent = componentName;
							components[data.name] = (data);
						}
					})
				}

				astInfo[componentName] = components;
				componentTree[componentName] = {
					id: componentName,
					children: []
				}
			}	
	  	});
	});
});

function buildSnapshot(data) {
	const { components, insertedNodes, deletedNodes, addedEventListeners, stateObject } = data;
	const diff = {
		newComponents: [],
		deletedComponents: [],
		changedVariables: {}
	};

	// delete nodes and descendents
	deletedNodes.forEach(node => {
		deleteNode(node.id);
	})

	// build nodes object
	insertedNodes.forEach(node => {
		nodes[node.id] = {
			children: [],
			id: node.id,
			component: node.component, 
			target: node.target,
			loc: node.loc,
		}
		// add as a child to target node
		if (typeof node.target === "number") {
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
		// assign to listeners object
		listeners[listener.id] = listenerData;
	});

	// build components and assign nodes and variables
	components.forEach(component => {
		const { tagName, id, instance } = component;

		const data = {
			tagName,
			id,
			nodes: {},
			variables: {},
			active: true,
			instance
		};

		const targets = {};
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
				// push node target and node to targetArray for later reference
				targets[node.target] = true;
				targets[node.id] = true;
			}
		})

		// identify the top-level parent node for the component
		let parentNode;
		if (component.target) {
			parentNode = component.target;
			domParent = component.id;
		}
		parentNode = Math.min(...Object.keys(targets));
		data.parentNode = parentNode;
		data.targets = targets;

		// add event listeners
		addedEventListeners.forEach(listener => {
			if (data.nodes.hasOwnProperty(listener.node)) {
				// update listener object to include full component id with instance number
				listeners[listener.id].component = id;
			}
		})

		// assign variables to components using state object
		const variables = stateObject[id];
		for (let variable in variables) {
			const varData = {
				name: variable,
				component: id,
				value: variables[variable].value
			}
			
			data.variables[varData.name] = varData;
		}

		diff.newComponents.push({component: id, variables: data.variables});

		componentData[id] = data;
	});

	// assign any remaining inserted Nodes that didn't go to new components
	insertedNodes.forEach(node => {
		// loop through components in case there are multiple instances
		for (let component in componentData) {
			if (componentData[component].tagName === node.component && componentData[component].targets.hasOwnProperty(node.target)) {
				// update node component to include full component id with instance number
				nodes[node.id].component = componentData[component].id;
				// assign node by reference to component data
				componentData[component].nodes[node.id] = nodes[node.id];
				// store node target and node id for later reference
				componentData[component].targets[node.target] = true;
				componentData[component].targets[node.id] = true;
			}
		}
	})

	// determine and assign the DOM parent (can't happen until all components are built and have nodes assigned)
	for (let component in componentData) {
		const { parentNode } = componentData[component];
		componentData[component].parent = (nodes.hasOwnProperty(parentNode)) ? nodes[parentNode].component : ((component === domParent) ? null : domParent);
		componentData[component].children = [];
	}

	// re-assign children to components and determine if component is active in the DOM
	for (let i in componentData) {
		const component = componentData[i];
		const parent = component.parent;
		if (parent) {
			componentData[parent].children.push(component);
		}
		// if no current nodes, mark component as not active
		if (!Object.keys(component.nodes).length && component.id !== domParent) {
			if (component.active === true) {
				component.active = false;
				diff.deletedComponents.push({component: component.id, variables: component.variables});
			}
		}
		else {
			component.active = true;
		}
	}

	// update state variables
	const storeDiff = {};
	for (let component in componentData) {
		const componentDiff = {};
		for(let i in componentData[component].variables) {
			let data;
			const variable = componentData[component].variables[i];
			// if variable is in componentData but not in stateObject, new value is null
			if (!stateObject[component].hasOwnProperty(variable.name)) {
				data = {
					name: variable.name,
					oldValue: variable.value !== undefined ? getDiffValue(variable.value) : "undefined",
					newValue: null,
				}
				variable.value = null;
			}
			
			else if (!(_.isEqual(variable.value, stateObject[component][variable.name].value))) {
				data = {
					name: variable.name,
					oldValue: variable.value !== undefined ? getDiffValue(variable.value) : "undefined",
					newValue: getDiffValue(stateObject[component][variable.name].value),
				}
						
				variable.value = stateObject[component][variable.name].value;
			}

			// if variable is in stateObject but not in componentData, old value is null
			for (let variable in stateObject[component]) {
				if (!componentData[component].variables.hasOwnProperty(variable)) {
					data = {
						name: variable,
						oldValue: null,
						newValue: getDiffValue(stateObject[component][variable.name].value),
					}
					componentData[component].variables.variable = stateObject[component][variable];
				}
			}

			// if there are diffs, add to component diff or store diff
			if (data) {
				if (variable.name[0] === '$') {
					data.component = 'Store'
					storeDiff[variable.name] = data;
				}
				else {
					data.component = component;
					componentDiff[variable.name] = data;
				}
			}
		}
		
		if (!_.isEmpty(componentDiff)) {
			diff.changedVariables[component] = componentDiff;
		}	
	}

	if (!_.isEmpty(storeDiff)) {
		diff.changedVariables['Store'] = storeDiff;
	}

	let currentTree = get(fileTree);
	if (_.isEmpty(currentTree)) {
		// assign component children
		for (let file in astInfo) {
			for (let childFile in astInfo[file].components) {
				componentTree[file].children.push(componentTree[childFile]);
				componentTree[childFile].parent = file;
			}
		}

		// determine top-level parent component
		for (let file in astInfo) {
			if (!componentTree[file].parent) {
				parentComponent = file;
			}
		}

		if (!_.isEmpty(componentTree)) {
			fileTree.set(componentTree[parentComponent]);
		}


		// set fileTree for hierarchical displays
	 	fileTree.set(componentTree[parentComponent]);

		//create depth-first ordering of tree for state injections
		const flatTreeArray = [];

		// if AST came through, make flat file tree based on that; otherwise use componentData
		if (!_.isEmpty(componentTree)) {
			depthFirstTraverse(componentTree[parentComponent]);
		}
		else {
			depthFirstTraverse(componentData[domParent]);
		}
		
		function depthFirstTraverse(tree) {
			flatTreeArray.push(tree.tagName || tree.id);
			if (tree.children.length) {
				tree.children.forEach(child => {
					depthFirstTraverse(child);
				})
			}
		}

		flatFileTree.set(flatTreeArray);	
	};

	const snapshot = {
		data: componentData,
		parent: domParent,
		label: (snapshotLabel ? snapshotLabel : "Unlabeled Snapshot"),
		diff
	}

	const deepCloneSnapshot = JSON.parse(JSON.stringify(snapshot))

	snapshotLabel = undefined;

	return deepCloneSnapshot; // deep clone to "freeze" state
}

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

function getDiffValue(value) {
	let text = '';
	
	if (value === null || typeof value !== "object") {
		text += value;
	}
	else {
		text += '\n';
		for (let i in value) {
			nested(value[i], 1);
		}
	}
	
	return text;

	function nested(obj, tabCount){
		if(obj.value) {  
			// add tabs based on the level in the recursion
			for (let i = 1; i <= tabCount; i++) {
				text = text + "\t"
			}
			text = text + obj.name + ":";
			if (typeof obj.value !=='object') {
				text = text + obj.value + "\n";
			}
			else {
				tabCount++;
				text = text + "\n";
				for(let val in obj.value ) {
					nested(obj.value[val], tabCount);
				}
			}
		}
	}
}