import DataStore from "./DataStore.js";
import SnapshotProducer from "./SnapshotProducer.js";
import SvelteEventParser from "./SvelteEventParser.js";

/**  Class responsible for listening for and routing events within the user context. */
export default class Router {
  #parser;
  #producer;
  #dataStore;

  /**
   * Creates a Router object
   */
  constructor() {
    this.#dataStore = new DataStore();
    this.#parser = new SvelteEventParser(this.#dataStore);
    this.#producer = new SnapshotProducer(this.#dataStore);
    this.#addEventListeners();
  }

  getDataStore() {
    return this.#dataStore;
  }

  /**
   * Initializes event listeners on the window object.
   *
   */
  #addEventListeners() {
    window.addEventListener("SvelteRegisterComponent", (e) => {
      this.#parser.handleRegisterComponent(e);
    });

    window.addEventListener("SvelteDOMAddEventListener", (e) => {
      this.#addAppEventListener(e);
    });

    //on completion of initial page load, capture first state snapshot and start watching for subsequent DOM updates
    window.addEventListener("load", () => {
      this.#producer.processDOMUpdate();
      this.#startMutationObserver();
    });
  }

  /**
   * Creates MutationObserver and configures to begin watching for DOM changes
   */
  #startMutationObserver() {
    const observer = new MutationObserver(() => {
      // on completion of each set of DOM updates, capture a new state snapshot
      this.#producer.processDOMUpdate();
    });

    observer.observe(window.document, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * Creates event listener on node in user app mirroring a newly added within-app listener.
   *
   * This function handles a SvelteAddEventListener event by adding a listener corresponding to the in-app listener that will
   * send data about this particular user interaction to the SvelteEventParser. This data will be used by the Parser to label
   * the snapshot representing changes related to this user interaction with the event type that was fired, the component where
   * interaction originated, and the name of the handler function that triggered the state change.
   *
   * @param {*} e
   */
  #addAppEventListener(e) {
    const { event, handler, node } = e.detail;
    node.addEventListener(event, () =>
      this.#parser.processAppEvent(node, event, handler)
    );
  }
}
