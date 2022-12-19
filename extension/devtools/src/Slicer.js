import DOMEventParser from "./DOMEventParser.js";

/** Class responsible for coordinating data for snapshot production and state injections. */
export default class Slicer {
  /**
   * Creates a Slicer object.
   */
  constructor() {
    // data stores
    this.componentInstances = {};
    this.componentRepresentations = {};

    // services
    this.parser = new DOMEventParser();
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
   * Gather data about current application state and send to SnapshotProducer.
   */
  captureSnapshot() {
    console.log(this.componentInstances);
    console.log(this.componentRepresentations);
    this.producer.createSnapshot();
  }
}
