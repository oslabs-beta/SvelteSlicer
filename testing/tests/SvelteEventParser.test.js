/**
 * @happy-dom/jest-environment
 */
/*eslint-env jest */
import TestAppContext from "../utils/TestAppContext.js";
import { describe, expect } from "@jest/globals";
import { testData } from "../mocks/testData.js";
import { SvelteComponent } from "svelte";

const context = new TestAppContext();

describe.each(testData)("Test $name", (testApp) => {
  const expected = testApp.data;
  let dataStore; // can't be assigned until router instance is created and stored in the context

  beforeAll(async () => {
    await context.testSetUp(testApp.app);
    dataStore = context.router.dataStore; // reassign after set up to bring data from router instance into "describe" scope
    return;
  });

  afterAll(() => {
    context.cleanUp();
  });

  describe("Handle RegisterComponent events", () => {
    it("Adds new component representations to componentRepresentations map", () => {
      const { componentRepresentations } = dataStore;
      const components = Object.keys(componentRepresentations);
      const representation = componentRepresentations[components[0]];
      const { totalComponents, componentIds } = expected;
      expect(components.length).toBe(totalComponents);
      expect(components).toEqual(expect.arrayContaining(componentIds));
      expect(representation).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          tagName: expect.any(String),
          children: expect.arrayContaining([]),
        })
      );
    });

    it("Adds new component instances to componentInstances map", () => {
      const { componentInstances } = dataStore;
      const components = Object.keys(componentInstances);
      const instance = componentInstances[components[0]];
      const { totalComponents, componentIds } = expected;
      expect(components.length).toBe(totalComponents);
      expect(components).toEqual(expect.arrayContaining(componentIds));
      expect(instance).toBeInstanceOf(SvelteComponent);
    });
  });
});
