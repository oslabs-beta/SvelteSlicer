<script>
  $: text = null;

  function clickHandler() {
    text = "Click Handled";
  }
  function inputHandler() {
    text = "Input Handled!";
  }
</script>

<main>
  <button on:click={clickHandler}> Click me </button>
  <input type="text" on:input={inputHandler} />
  <p>{text}</p>
</main>
