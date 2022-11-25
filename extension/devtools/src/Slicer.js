import DOMEventParser from "./DOMEventParser";
//import ComponentInjector from './ComponentInjector';
import SnapshotProducer from "./SnapshotProducer";

export default class Slicer {
  constructor() {
    // data stores
    this.componentInstances = {};
    this.newComponents = [];
    this.stateHistory = [];
    this.label = "Init";
    this.componentRepresentations = {};

    // services
    this.parser = new DOMEventParser();
    //this.injector = new ComponentInjector();
    this.producer = new SnapshotProducer();
  }

  processNewComponentEvent(eventDetail) {
    const { component, tagName } = eventDetail;
    const id = this.parser.assignComponentId(tagName);
    this.componentInstances[id] = component;
    this.newComponents.push(id);
    this.componentRepresentations[id] = { id, tagName };
  }

  processNewNodeEvent(eventDetail) {
    console.log("new node");
    console.log(eventDetail);
  }

  processNewEventListenerEvent(eventDetail) {
    console.log("new event listener");
    console.log(eventDetail);
  }

  captureSnapshot() {
    console.log(this.componentInstances);
    console.log(this.newComponents);
    console.log(this.componentRepresentations);
    this.producer.createSnapshot();
  }
}
