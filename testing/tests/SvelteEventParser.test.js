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
  let expected;
  let dataStore;

  beforeAll(async () => {
    const { app, data } = testApp;
    await context.testSetUp(app);
    expected = data;
    dataStore = context.router.dataStore;
    return;
  });

  afterAll(() => {
    context.cleanUp();
  });

  describe("Handle RegisterComponent events", () => {
    it("Adds new component representations to componentRepresentations map", () => {
      const components = Object.keys(dataStore.componentRepresentations);
      const representation = dataStore.componentRepresentations[components[0]];
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
      const components = Object.keys(dataStore.componentInstances);
      const instance = dataStore.componentInstances[components[0]];
      const { totalComponents, componentIds } = expected;
      expect(components.length).toBe(totalComponents);
      expect(components).toEqual(expect.arrayContaining(componentIds));
      expect(instance).toBeInstanceOf(SvelteComponent);
    });
  });
});
