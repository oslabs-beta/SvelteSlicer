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
const astInfo = {};

// for debugging, store any AST variables not caught by switch statements
const uncaughtVariables = [];

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
		const newSnapshot = buildNewSnapshot(data);
		snapshots.update(array => [...array, newSnapshot]);
	}
	else if (type === "event") {
		//do something
	}
});

// get and parse through the AST for additional variable info
/*chrome.devtools.inspectedWindow.getResources(resources => {
	const arrSvelteFiles = resources.filter(file =>file.url.includes(".svelte"));
	arrSvelteFiles.forEach(svelteFile => {
	  	svelteFile.getContent(source => {
			if (source) {
				const { ast, vars } = compile(source, {varsReport: 'full'});
				const componentName = svelteFile.url.slice((svelteFile.url.lastIndexOf('/') + 1), -7);
				const astVariables = ast.instance.content.body;
				const varObj = {};		// hold parsed data
				astVariables.forEach(variable => {
					let data;
					switch (variable.type) {
						case "ExportNamedDeclaration":
							if (variable.declaration.type !== "FunctionDeclaration") {
								data = {
									name: variable.declaration.declarations[0].id.name,
									value: (variable.declaration.declarations[0].init) ? variable.declaration.declarations[0].init.value : null,
									type: "prop",
									ctxVariable: false
								}
							}
							else {
								data = {
									name: variable.declaration.id.name,
									object: variable.declaration.body.body[0].expression.callee.object.name,
									type: "function",
									ctxVariable: false
								}
							}
							break;
						case "ImportDeclaration":
							data = {
								name: variable.specifiers[0].local.name,
								value: null,
								ctxVariable: false
							}
							if (variable.source.value.includes('.svelte')) {
								data.type = "component"
							}
							else if (variable.source.value.endsWith('.js') && variable.source.value.includes('/store')) {
								data.type = "store"
							}
							else if (variable.source.value.endsWith('.js') && variable.source.value.includes('/action')) {
								data.type = "action"
							}
							else {
								data.type = "packageImport"
							}
							break;
						case "VariableDeclaration":
							const declaration = variable.declarations[0];
							data = {
								name: declaration.id.name,
								ctxVariable: false
							}
							if (!declaration.init) {
								data.value = null;
								data.type = "stateVariable"
							}
							else if (declaration.init.type === "Literal") {
								data.value = declaration.init.value;
								data.type = "stateVariable";
							}
							else if (declaration.init.type === "CallExpression") {
								data.type = "functionCall";
							}
							else if (declaration.init.type === "ArrowFunctionExpression") {
								data.type = "function";
							}
							else if (declaration.init.type === "MemberExpression") {
								data.type = "stateVariable";
								data.value = declaration.init.object.name + "." + declaration.init.property.name;
							}
							else {
								uncaughtVariables.push(variable);
							}
							break;
						case "FunctionDeclaration":
							data = {
								name: variable.id.name,
								type: "function",
								ctxVariable: false
							}
							break;
						case "LabeledStatement":
							if (variable.body.type !== "ExpressionStatement") {
								data = {
									name: null,
									type: "reactiveStatement",
									ctxVariable: false
								}
							}
							else if (variable.body.expression.type === "AssignmentExpression") {
								data = {
									name: variable.body.expression.left.name,
									type: "reactiveVariable",
									ctxVariable: false
								}
							}
							else if (variable.body.expression.type === "CallExpression") {
								data = {
									name: null,
									type: "reactiveFunction",
									ctxVariable: false
								}
							}
							else {
								uncaughtVariables.push(variable);
							}
							break;
						case "ExpressionStatement":
							data = {
								name: variable.expression.callee.name,
								type: "functionCall",
								ctxVariable: false
							}
							break;
						default:
							uncaughtVariables.push(variable);
					}	
					varObj[data.name] = data;
				})
				console.log(componentName);
				vars.forEach(variable => {
					// if state variable, take of leading $ on name
					if (variable.name[0] === "$") {
						variable.name = variable.name.slice(1);
					}
					console.log(variable.name);
					// mark ctx variables (must be prop OR referenced and mutated or assigned);
					if ((variable.referenced && (variable.reassigned || variable.mutated)) || varObj[variable.name].type === "prop") {
						varObj[variable.name].ctxVariable = true;
					}
				})
				console.log(varObj);
				astInfo[componentName] = varObj;
			}	
	  	});
	});
});*/

function buildFirstSnapshot(data) {
	const { components, insertedNodes, addedEventListeners } = data;
	
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

		// assign to associated node in nodes
		nodes[listener.node].listeners[listener.id] = listenerData;
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
			nodes: {},
			listeners: {},
			active: true
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

		// identify the top-level parent node for the component
		const parentNode = (targets.includes("body")) ? "body" : Math.min(...targets);
		data.parentNode = parentNode;
		data.targets = targets;

		addedEventListeners.forEach(listener => {
			if (data.nodes.hasOwnProperty(listener.node)) {
				// update listener object to include full component id with instance number
				listeners[listener.id].component = id;
				// assign to component 
				data.listeners[listener.id] = listeners[listener.id];
			}
		})

/*		// assign variables to components using AST data and ctx
		const astVariables = astInfo[tagName];
		console.log(tagName);
		console.log('original ctx')
		console.log(ctx);
		console.log('injectState');
		console.log(injectState);
		console.log('astVariables');
		console.log(astVariables);
		const unclaimedIndices = [];
		for (let i in astVariables) {
			const astVariable = astVariables[i];
			const varData = {
				name: astVariable.name,
				type: astVariable.type,
				component: id
			}
			if (astVariable.ctxVariable) {
				if (injectState.hasOwnProperty(astVariable.name)) {
					const index = injectState[astVariable.name]
					varData.ctxIndex = index;
					varData.value = ctx[index];
					delete ctx[index];
				}
				// if not in injectState, push to array for later processing
				else unclaimedIndices.push(astVariable);
			}
			data.variables[varData.name] = varData;
		}

		console.log('altered ctx');
		console.log(ctx);
		console.log('unclaimedIndices');
		console.log(unclaimedIndices);*/

		componentData[id] = data;
	});

	// determine and assign the parent component
	for (let component in componentData) {
		const { parentNode } = componentData[component];
		componentData[component].parent = (parentNode === "body") ? "App0" : ((nodes.hasOwnProperty(parentNode)) ? nodes[parentNode].component : null);
		componentData[component].children = [];
	}

	// assign children to components
	for (let i in componentData) {
		const component = componentData[i];
		const parent = component.parent;
		if (parent) {
			componentData[parent].children.push(component);
		}
	}

	const snapshot = JSON.parse(JSON.stringify(componentData.App0)) // deep copy to "freeze" state

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
		
		// create object with all associated nodes
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
				// push node target and node to targetArray for later reference
				targets.push(node.target);
				targets.push(node.id);
			}
		})

		// identify the target node for the component
		const parentNode = (targets.includes("body")) ? "body" : Math.min(...targets);
		data.parentNode = parentNode;
		data.targets = [targets];

		componentData[id] = data;
	})

	// assign any remaining inserted Nodes that didn't go to new components
	insertedNodes.forEach(node => {
		// loop through components in case there are multiple instances
		for (let component in componentData) {
			if (componentData[component].tagName === node.component && componentData[component].targets.includes(node.target)) {
				// update node component to include full component id with instance number
				nodes[node.id].component = componentData[component].id;
				// assign node by reference to component data
				componentData[component].nodes[node.id] = nodes[node.id];
				// push node target and node id to targetArray for later reference
				componentData[component].targets.push(node.target);
				componentData[component].targets.push(node.id);
			}
		}
	})

	// determine and assign the parent component
	for (let component in componentData) {
		const { parentNode } = componentData[component];
		if (parentNode) {
			componentData[component].parent = (parentNode === "body") ? "App0" : ((nodes.hasOwnProperty(parentNode)) ? nodes[parentNode].component : null);
		}
		else {
			componentData[component].parent = null;
		}
		componentData[component].children = [];
	}

	// update listeners object and assign listeners to nodes and components
	addedEventListeners.forEach(listener => {
		const { component } = nodes[listener.node]
		const listenerData = {
			node: listener.node,
			event: listener.event,
			name: listener.handlerName,
			string: listener.handlerString,
			component: component,
			id: listener.id
		}
		// assign to listenerData object
		listeners[listener.id] = listenerData;

		// assign to associated node in nodes
		nodes[listener.node].listeners[listener.id] = listenerData;

		// assign to associated component
		componentData[component].listeners[listener.id] = listenerData;
		componentData[component].nodes[listener.node].listeners[listener.id] = listeners[listener.id];


	});

	// re-assign children to components and determine if component is active in the DOM
	for (let i in componentData) {
		const component = componentData[i];
		const parent = component.parent;
		if (parent) {
			componentData[parent].children.push(component);
		}
		// if no current nodes, mark component as not active
		if (!Object.keys(component.nodes).length && component.tagName !== "App") {
			component.active = false;
		}
	}

	const newSnapshot = JSON.parse(JSON.stringify(componentData.App0)) // deep copy to "freeze" state

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