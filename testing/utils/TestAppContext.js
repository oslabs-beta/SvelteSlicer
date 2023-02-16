/**
 * @jest-environment happy-dom
 */
/*eslint-env jest */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { init } from "../../extension/devtools/build/injectedTest.js";

/** Class that creates and exposes testing environment for backend integration testing */
export default class TestAppContext {
  /**
   * Creates a TestAppContext object
   */
  constructor() {
    this.appWindow = null;
    this.router = null;
    this.registrator = GlobalRegistrator;
  }

  async testSetUp(appInstance) {
    // create a happy-dom instance and registers it globally
    this.registrator.register();
    this.appWindow = window;

    // create the router instance and store it
    this.router = init();

    // create the app instance and store it
    this.app = new appInstance({ target: document.body });

    // wait for the first page load to complete before exiting setup
    await new Promise((resolve) => {
      window.addEventListener("load", () => {
        resolve();
      });
    });

    return;
  }

  cleanUp() {
    this.registrator.unregister();
  }
}
