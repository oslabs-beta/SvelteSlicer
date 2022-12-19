import DOMEventParser from "./DOMEventParser.js";
import SnapshotProducer from "./SnapshotProducer.js";

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
    this.producer = new SnapshotProducer();
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
    const instances = JSON.parse(JSON.stringify(this.componentInstances));
    const representations = JSON.parse(
      JSON.stringify(this.componentRepresentations)
    );
    console.log(instances);
    console.log(representations);
    this.producer.createSnapshot();
  }
}
