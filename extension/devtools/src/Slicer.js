//import DOMEventParser from './DOMEventParser';
//import ComponentInjector from './ComponentInjector';
//import SnapshotProducer from './SnapshotProducer';

export default class Slicer {
  constructor() {
    // data stores
    this.componentInstances = new Map();
    this.newComponentRepresentations = [];
    this.stateHistory = [];
    this.label = "Init";
    this.componentRepresentations = {};

    // services
    //this.parser = new DOMEventParser();
    //this.injector = new ComponentInjector();
    //this.producer = new SnapshotProducer();

    this.addEventListeners();
  }

  addEventListeners() {
    //window.addEventListener("SvelteDOMInsert", this.parseNewNode.bind(this));
    //window.addEventListener("SvelteRegisterComponent", this.parseNewComponent.bind(this));
    //window.addEventListener("SvelteDOMAddEventListener", this.parseNewEventListener.bind(this));
    window.addEventListener("load", () => {
      this.createSnapshot();
      this.startMutationObserver();
    });
  }

  parseNewNode(event) {
    //const newRelationships = this.parser.getRelationships(event);
    console.log(event);
  }

  parseNewComponent(event) {
    //const newComponents = this.parser.getNewComponents(event);
    console.log(event);
  }

  parseNewEventListener(event) {
    //this.parser.addNewEventListener(event);
    console.log(event);
  }

  startMutationObserver() {
    const observer = new MutationObserver(() => {
      this.createSnapshot();
    });
    observer.observe(window.document, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  createSnapshot() {
    console.log("create snapshot");
  }
}
