<script>
  /*
    App with one child with a leaf node child, and one leaf node child.
  
                          TestApp5
                          /      \
                      LeafChild1    Child1
                                       | 
                                    LeafChild2
    */

  import Child from "../components/Child.svelte";
  import LeafChild from "../components/LeafChild.svelte";
</script>

<main>
  <LeafChild />
  <Child />
</main>
