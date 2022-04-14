<script>
  export let variable;
  //console.log("var",variable)
</script>

<main>
  {#if typeof variable.value !== 'object' || variable.value === null}
    {#if variable.value === ''}
      <p class="variableVal">{variable.name}: ' '</p>
    {:else}
      <p class="variableVal">{variable.name}: {variable.value}</p>
    {/if}
  {:else}
    <div class="variableVal">
      <p id="variableName">{variable.name}:</p>
      <ul class="variableVal">
        {#each Object.keys(variable.value) as nestedValue}
          <li>
            <svelte:self variable={variable.value[nestedValue]} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</main>
