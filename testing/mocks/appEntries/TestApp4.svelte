<script>
  /* 
  App with two children that each have a nested child.

                        TestApp4
                        /       \
                    Child1     Child2
                      |           |
                  LeafChild1   LeafChild2
  */

  import Child from "../components/Child.svelte";
</script>

<main>
  <Child />
  <Child />
</main>
