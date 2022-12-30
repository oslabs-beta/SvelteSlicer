import DataStore from "./DataStore.js";
import SnapshotProducer from "./SnapshotProducer.js";
import SvelteEventParser from "./SvelteEventParser.js";

/**  Class responsible for listening for and routing events within the user context. */
export default class Router {
  /**
   * Creates a Router object
   */
  constructor() {
    this.dataStore = new DataStore();
    this.parser = new SvelteEventParser(this.dataStore);
    this.producer = new SnapshotProducer(this.dataStore);
    this.addEventListeners();
  }

  /**
   * Initializes event listeners on the window object.
   *
   */
  addEventListeners() {
    window.addEventListener("SvelteRegisterComponent", (e) => {
      this.parser.handleRegisterComponent(e);
    });

    //on completion of initial page load, capture first state snapshot and start watching for subsequent DOM updates
    window.addEventListener("load", () => {
      this.producer.processDOMUpdate();
      this.startMutationObserver();
    });
  }

  /**
   * Creates MutationObserver and configures to begin watching for DOM changes
   */
  startMutationObserver() {
    const observer = new MutationObserver(() => {
      // on completion of each set of DOM updates, capture a new state snapshot
      this.producer.processDOMUpdate();
    });

    observer.observe(window.document, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
}
