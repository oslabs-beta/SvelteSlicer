import SingleChildApp from "./appEntries/SingleChildApp.svelte";
import SimpleSiblingsApp from "./appEntries/SimpleSiblingsApp.svelte";
import NestedChildrenApp from "./appEntries/NestedChildrenApp.svelte";

export const testData = [
  {
    name: "SingleChildApp",
    app: SingleChildApp.default,
    data: {
      totalComponents: 2,
      componentIds: ["SingleChildApp1", "LeafChild1"],
      children: {
        SingleChildApp1: ["LeafChild1"],
      },
    },
  },
  {
    name: "SimpleSiblingsApp",
    app: SimpleSiblingsApp.default,
    data: {
      totalComponents: 3,
      componentIds: ["SimpleSiblingsApp1", "LeafChild1", "LeafChild2"],
      children: {
        SimpleSiblingsApp1: ["LeafChild1", "LeafChild2"],
      },
    },
  },
  {
    name: "NestedChildrenApp",
    app: NestedChildrenApp.default,
    data: {
      totalComponents: 3,
      componentIds: ["NestedChildrenApp1", "Child1", "LeafChild1"],
      children: {
        NestedChildrenApp1: ["Child1"],
        Child1: ["LeafChild1"],
      },
    },
  },
];
