import Router from "./Router.js";

/**
 * Instantiates a Router object.
 * This is an IIFE so that Router object instantiates immediately on
 * injection into user context without polluting global namespace.
 */
(() => {
  new Router();
})();
