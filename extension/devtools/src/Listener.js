import Slicer from "./Slicer";

export default class Listener {
  constructor() {
    this.slicer = new Slicer();
    this.addEventListeners();
    console.log(this.slicer);
  }

  addEventListeners() {
    window.addEventListener("SvelteDOMInsert", (e) =>
      this.slicer.processNewNodeEvent(e.detail)
    );
    window.addEventListener("SvelteRegisterComponent", (e) =>
      this.slicer.processNewComponentEvent(e.detail)
    );
    window.addEventListener("SvelteDOMAddEventListener", (e) =>
      this.slicer.processNewEventListenerEvent(e.detail)
    );
    window.addEventListener("load", () => {
      this.slicer.captureSnapshot();
      this.startMutationObserver();
    });
  }

  startMutationObserver() {
    const observer = new MutationObserver(() => {
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
