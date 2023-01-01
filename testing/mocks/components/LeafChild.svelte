<script>
  function clickHandlerOne() {
    console.log("Button One clicked");
  }
  function clickHandlerTwo() {
    console.log("Button Two clicked");
  }
</script>

<main>
  <button on:click={clickHandlerOne} class="button-one"> Click me </button>
  <button on:click={clickHandlerTwo} class="button-two"> Click me </button>
</main>
