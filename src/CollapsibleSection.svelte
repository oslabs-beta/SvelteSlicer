<script>
  export let headerText;

  let expanded = false;
</script>

<div class="collapsible">
  <h3>
    <button
      aria-expanded={expanded}
      on:click={() => (expanded = !expanded)}
      class="variableVal"
      >{headerText}
      <svg viewBox="0 0 20 20" fill="none">
        <path
          class="vert"
          d="M10 1V19"
          stroke="rgb(238, 137, 5)"
          stroke-width="5"
        />
        <path d="M1 10L19 10" stroke="rgb(238, 137, 5)" stroke-width="5" />
      </svg>
    </button>
  </h3>

  <div class="contents" hidden={!expanded}>
    <slot />
  </div>
</div>

<style>
  h3 {
    margin: 0;
  }

  button {
    background-color: var(--background, #fff);
    color: var(--gray-darkest, #282828);
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: none;
    margin: 0;
    padding: 1em 0.5em;
  }

  button[aria-expanded="true"] .vert {
    display: none;
  }

  svg {
    height: 0.7em;
    width: 0.7em;
  }
</style>
