/* This is an alternate entry point for the backend system
created to faciliate testing. We need to expose the Router 
instance to the global context, so we create an exported 
function that can be called from the testing environment.
*/

import Router from "../../extension/devtools/src/Router.js";

/**
 * Instantiates a Router object and returns it.
 */
export function init() {
  return new Router();
}
