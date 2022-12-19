import Listener from "./Listener.js";

/**
 * Instantiates a Listener object.
 * This is an IIFE so that Listener object instantiates immediately on injection into user context without polluting global namespace.
 */
(() => {
  new Listener();
})();
