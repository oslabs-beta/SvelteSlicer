import TestApp1 from "./appEntries/TestApp1.svelte";
import TestApp2 from "./appEntries/TestApp2.svelte";
import TestApp3 from "./appEntries/TestApp3.svelte";
import TestApp4 from "./appEntries/TestApp4.svelte";
import TestApp5 from "./appEntries/TestApp5.svelte";
import TestApp6 from "./appEntries/TestApp6.svelte";
import TestApp7 from "./appEntries/TestApp7.svelte";

export const testData = [
  {
    name: "TestApp1",
    app: TestApp1.default,
    data: {
      totalComponents: 2,
      componentIds: ["TestApp11", "LeafChild1"],
      children: {
        TestApp1: ["LeafChild1"],
      },
    },
  },
  {
    name: "TestApp2",
    app: TestApp2.default,
    data: {
      totalComponents: 3,
      componentIds: ["TestApp21", "LeafChild1", "LeafChild2"],
      children: {
        TestApp21: ["LeafChild1", "LeafChild2"],
      },
    },
  },
  {
    name: "TestApp3",
    app: TestApp3.default,
    data: {
      totalComponents: 3,
      componentIds: ["TestApp31", "Child1", "LeafChild1"],
      children: {
        TestApp31: ["Child1"],
        Child1: ["LeafChild1"],
      },
    },
  },
  {
    name: "TestApp4",
    app: TestApp4.default,
    data: {
      totalComponents: 5,
      componentIds: [
        "TestApp41",
        "Child1",
        "LeafChild1",
        "Child2",
        "LeafChild2",
      ],
      children: {
        TestApp41: ["Child1", "Child2"],
        Child1: ["LeafChild1"],
        Child2: ["LeafChild2"],
      },
    },
  },
  {
    name: "TestApp5",
    app: TestApp5.default,
    data: {
      totalComponents: 4,
      componentIds: ["TestApp51", "Child1", "LeafChild1", "LeafChild2"],
      children: {
        TestApp51: ["Child1", "LeafChild2"],
        Child1: ["LeafChild1"],
      },
    },
  },
  {
    name: "TestApp6",
    app: TestApp6.default,
    data: {
      totalComponents: 4,
      componentIds: ["TestApp61", "ChildTwo1", "LeafChild1", "LeafChild2"],
      children: {
        TestApp61: ["ChildTwo1"],
        ChildTwo1: ["LeafChild1", "LeafChild2"],
      },
    },
  },
  {
    name: "TestApp7",
    app: TestApp7.default,
    data: {
      totalComponents: 4,
      componentIds: ["TestApp71", "Child1", "LeafChild1", "LeafChild2"],
      children: {
        TestApp51: ["Child1", "LeafChild1"],
        Child1: ["LeafChild2"],
      },
    },
  },
];
