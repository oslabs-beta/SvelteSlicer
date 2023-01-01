<script>
  /*
  App with one child with a leaf node child, and one leaf node child.

                        TestApp5
                        /      \
                    Child1    LeafChild2
                      | 
                  LeafChild1
  */

  import Child from "../components/Child.svelte";
  import LeafChild from "../components/LeafChild.svelte";
</script>

<main>
  <Child />
  <LeafChild />
</main>
