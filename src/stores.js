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

// for debugging, store any AST variables not caught by switch statements
const uncaughtVariables = [];

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
				const { ast, vars } = compile(source, {varsReport: 'full'});
				const componentName = svelteFile.url.slice((svelteFile.url.lastIndexOf('/') + 1), svelteFile.url.lastIndexOf('.svelte'));
				const variables = {};
				const functions = {};
				const components = {};		
				if (ast.instance) {
					const astVariables = ast.instance.content.body;
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
									variables[data.name] = data;
								}
								else {
									data = {
										name: variable.declaration.id.name,
										object: variable.declaration.body.body[0].expression.callee.object.name,
										type: "function",
										ctxVariable: false
									}
									functions[data.name] = data;
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
									data.parent = componentName;
									components[data.name] = data;
								}
								else if (variable.source.value.includes('/store')) {
									data.type = "store"
									variables[data.name] = data;
								}
								else if (variable.source.value.includes('/action')) {
									data.type = "action"
									functions[data.name] = data;
								}
								else {
									uncaughtVariables.push(variable);
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
									variables[data.name] = data;
								}
								else if (declaration.init.type === "Literal") {
									data.value = declaration.init.value;
									data.type = "stateVariable";
									variables[data.name] = data;
								}
								else if (declaration.init.type === "ArrowFunctionExpression") {
									data.type = "function";
									functions[data.name] = data;
								}
								else if (declaration.init.type === "MemberExpression") {
									data.type = "stateVariable";
									variables[data.name] = data;
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
								functions[data.name] = data;
								break;
							case "LabeledStatement":
								if (variable.body.expression && variable.body.expression.type === "AssignmentExpression") {
									data = {
										name: variable.body.expression.left.name,
										type: "reactiveVariable",
										ctxVariable: false
									}
									variables[data.name] = data;
								}
								else {
									uncaughtVariables.push(variable);
								}
								break;
							default:
								uncaughtVariables.push(variable);
								break;
						}
					})
				}
				
				vars.forEach(variable => {
					// if state variable, take of leading $ on name
					if (variable.name[0] === "$") {
						variable.name = variable.name.slice(1);
					}
					// mark ctx variables (must be prop OR referenced and mutated or assigned);
					if (variables.hasOwnProperty(variable.name) && ((variable.referenced && (variable.reassigned || variable.mutated)) || variables[variable.name].type === "prop")) {
						variables[variable.name].ctxVariable = true;
					}
				})

				astInfo[componentName] = {variables, components, functions};
				componentTree[componentName] = {
					id: componentName,
					children: []
					
				}
			}	
	  	});
	});
});

function buildSnapshot(data) {
	const { components, insertedNodes, deletedNodes, addedEventListeners, ctxObject } = data;
	const diff = {
		newComponents: [],
		deletedComponents: [],
		changedVariables: []
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
		const { ctx, injectState, tagName, id, instance } = component;

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

		// assign variables to components using AST data and ctx
		const astVariables = astInfo[tagName].variables;
		const unclaimedVariables = [];
		for (let i in astVariables) {
			const astVariable = astVariables[i];
			const varData = {
				name: astVariable.name,
				type: astVariable.type,
				component: id,
				initValue: astVariable.value ? astVariable.value : null
			}
			if (astVariable.ctxVariable) {
				if (injectState.hasOwnProperty(astVariable.name)) {
					const index = injectState[astVariable.name]
					varData.ctxIndex = index;
					varData.value = ctx[index].value;
					delete ctx[index];
				}
				// if not in injectState, push to array for later processing
				else unclaimedVariables.push(astVariable);
			}
			data.variables[varData.name] = varData;
		}

		// match unassigned value indices in ctx with unclaimed variables
		unclaimedVariables.forEach(variable => {
			for (let i in ctx) {
				if (ctx[i].type === "value") {
					data.variables[variable.name].ctxIndex = i;
					data.variables[variable.name].value = ctx[i].value;
					delete ctx[i];
					break; 
				}
			}
		})
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

	// update ctx variables
	for (let component in componentData) {
		const componentDiff = [];
		for(let i in componentData[component].variables) {
			const variable = componentData[component].variables[i];
			if (variable.ctxIndex) {
				if (!(_.isEqual(variable.value, ctxObject[component][variable.ctxIndex].value))) {
					const data = {
						name: variable.name,
						oldValue: JSON.parse(JSON.stringify(variable.value !== undefined ? variable.value : "undefined")),
						newValue: ctxObject[component][variable.ctxIndex].value,
						component: variable.component,
						type: variable.type
					}
					componentDiff.push(data);
					variable.value = ctxObject[component][variable.ctxIndex].value;
				}
			}
		}
		if (componentDiff.length) {
			diff.changedVariables.push(componentDiff);
		}
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

		// set fileTree for hierarchical displays
	 	fileTree.set(componentTree[parentComponent]);

		//create depth-first ordering of tree for state injections
		const flatTreeArray = [];

		depthFirstTraverse(componentTree[parentComponent]);
		
		function depthFirstTraverse(tree) {
			flatTreeArray.push(tree.id);
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
