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
    this.app = null; // store app instance for running app
    this.router = null; // store router instance for running app
    this.registrator = GlobalRegistrator; // store happy-dom's GlobalRegistrator function
  }

  /**
   * Creates a happy-dom environment and creates and stores running instances of the mock app and the devtool backend within it.
   * @param { SvelteComponent } appInstance // The mock app to be tested.
   * @returns
   */
  async testSetUp(appInstance) {
    // create a happy-dom GlobalWindow and register it so that context is now mirrored globally
    this.registrator.register();

    // use exported function from injected script test file to create the Router instance and store it
    this.router = init();

    // create the app instance and store it
    this.app = new appInstance({ target: document.body });

    // wait for page load to complete before exiting setup so Router receives events for initial load before tests are run
    await new Promise((resolve) => {
      window.addEventListener("load", () => {
        resolve();
      });
    });

    return;
  }

  /**
   * Undoes the global registration of the GlobalWindow, allowing for another GlobalWindow to be registered.
   */
  cleanUp() {
    this.registrator.unregister();
  }
}
