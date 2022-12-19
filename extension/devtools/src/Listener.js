import Slicer from "./Slicer.js";

/**  Class responsible for managing event listeners within the user context. */
export default class Listener {
  /**
   * Creates a Listener object
   */
  constructor() {
    this.slicer = new Slicer();
    this.addEventListeners();
  }

  /**
   * Initializes event listeners on the window object.
   *
   */
  addEventListeners() {
    //window.addEventListener("SvelteDOMInsert", (e) =>
    //  this.slicer.processNewNode(e.detail)
    //);

    window.addEventListener("SvelteRegisterComponent", (event) => {
      this.slicer.processNewComponent(event);
    });

    //window.addEventListener("SvelteRegisterBlock", (e) => {

    //}
    //);

    //window.addEventListener("SvelteDOMAddEventListener", (e) =>
    //  this.slicer.processNewEventListenerEvent(e.detail)
    //);

    //on completion of page load, capture first state snapshot and start watching for subsequent DOM updates
    window.addEventListener("load", () => {
      this.slicer.captureSnapshot();
      this.startMutationObserver();
    });
  }

  /**
   * Creates MutationObserver and configures to begin watching for DOM changes
   */
  startMutationObserver() {
    const observer = new MutationObserver(() => {
      // on completion of each set of DOM updates, capture a new state snapshot
      this.slicer.captureSnapshot();
    });

    observer.observe(window.document, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
}
