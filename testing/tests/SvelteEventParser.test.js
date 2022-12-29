/**
 * @happy-dom/jest-environment
 */
/*eslint-env jest */
import TestAppContext from "../utils/TestAppContext.js"; // class that creates a context for running app where devtool internals are accessible
import { testData } from "../utils/testData.js"; // mapping of mock app entrypoints with expected values for different data points
import { SvelteComponent } from "svelte";
import { describe, expect } from "@jest/globals";

// initialize the testing context
const context = new TestAppContext();

// runs the full test suite for each mock app in the testData file
describe.each(testData)("Test $name", (testApp) => {
  const expected = testApp.data;
  let router;

  // get each mock app set up for testing
  beforeAll(async () => {
    // create the devtool backend and app in the testing context
    await context.testSetUp(testApp.app);
    // once context is prepped for this app, need to get router instance to outer scope to be accessible by tests
    router = context.router;
    return;
  });

  // close mock app to prepare for next set of tests
  afterAll(() => {
    context.cleanUp();
  });

  describe("Handle RegisterComponent events", () => {
    const { componentRepresentations, componentInstances } = router.dataStore;
    it("Adds new component representations to componentRepresentations map", () => {
      const components = Object.keys(componentRepresentations);
      const representation = componentRepresentations[components[0]];
      const { totalComponents, componentIds } = expected;
      // expect correct number of components to be stored
      expect(components.length).toBe(totalComponents);
      // expect correct componentId's
      expect(components).toEqual(expect.arrayContaining(componentIds));
      // expect correct data structure for representations
      expect(representation).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          tagName: expect.any(String),
          children: expect.arrayContaining([]),
        })
      );
    });

    it("Adds new component instances to componentInstances map", () => {
      const components = Object.keys(componentInstances);
      const instance = componentInstances[components[0]];
      const { totalComponents, componentIds } = expected;
      // expect correct number of components to be stored
      expect(components.length).toBe(totalComponents);
      // expect correct component Id's
      expect(components).toEqual(expect.arrayContaining(componentIds));
      // expect stored values to be SvelteComponenents
      expect(instance).toBeInstanceOf(SvelteComponent);
    });
  });
});
