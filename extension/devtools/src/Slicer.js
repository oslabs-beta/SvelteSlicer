import DOMEventParser from "./DOMEventParser";
//import ComponentInjector from './ComponentInjector';
//import SnapshotProducer from "./SnapshotProducer";

/** Class responsible for coordinating data for snapshot production and state injections. */
export default class Slicer {
  /**
   * Creates a Slicer object.
   */
  constructor() {
    // data stores
    this.componentInstances = {};
    //this.newComponents = {};
    //this.unassignedChildrenComponents = new Set();
    this.componentRepresentations = {};
    //this.rootComponent = null;
    //this.stateHistory = [];
    //this.label = "Initial Page Load";

    // services
    this.parser = new DOMEventParser();
    //this.injector = new ComponentInjector();
    //this.producer = new SnapshotProducer();
  }

  /**
   * Stores relevant data from newly registered component.
   * @param {CustomEvent} event
   */
  processNewComponent(event) {
    const { component, tagName } = event.detail;
    const id = this.parser.assignComponentId(tagName);
    this.componentInstances[id] = component;
    this.componentRepresentations[id] = { id, tagName, children: [] };
  }

  /**
   * Determines and stores component parent-child relationships based on data carried on newly created DOM nodes.
   * @param {CustomEvent} event
   */
  //processNewNode(event) {
  //  const { node, target, anchor } = event.detail;

  // only element nodes with null anchor properties can attach to nodes from a different component
  //  if (node.nodeType === 1 && anchor === null) {
  //    const nodeComponentTagName = this.parser.getComponentTagName(node);
  //    const targetComponentTagName = this.parser.getComponentTagName(target);
  // we only need the full component instance info if the node is from a different file than it's target
  //    if (nodeComponentTagName !== targetComponentTagName) {
  //      const [nodeComponent, targetComponent] = this.parser.getNodeComponents(node, target);
  //      console.log(nodeComponent, targetComponent);
  //    }
  //  }

  // root node's target won't have a __svelte_meta property, so assign this node's component as root component.
  //  if (!target.hasOwnProperty('__svelte_meta')) {
  //    this.rootComponent = this.parser.assignRootComponent(node);
  //  }
  //}

  //processNewEventListenerEvent(eventDetail) {
  //  console.log("new event listener");
  //  console.log(eventDetail);
  //}

  /**
   * Gather data about current application state and send to SnapshotProducer.
   */
  captureSnapshot() {
    console.log(this.componentInstances);
    //console.log(this.newComponents);
    console.log(this.componentRepresentations);
    //this.producer.createSnapshot();
  }
}
