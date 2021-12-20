<script>
    export let variable;

    console.log(variable);
</script>

<main>
    {#if typeof variable.value !== "object"}
    <p>{variable.name}: {variable.value}</p>
    {:else} 
        <p>{variable.name}: </p>
        <ul>
            {#each Object.keys(variable.value) as nestedValue}
                <li>
                    <svelte:self variable={variable.value[nestedValue]}/>
                </li>    
            {/each}
        </ul>
    {/if}
</main>