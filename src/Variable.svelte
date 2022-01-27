<script>
    export let variable;
    //console.log("var",variable)
</script>

<main>
    {#if typeof variable.value !== "object"}
    <!-- {#if variable.value instanceof !Object} -->
    <p class="variableVal">{variable.name}: {variable.value}</p>
    {:else} 
    <div class="variableVal">
        <p id="variableName">{variable.name}: </p>
            <ul class="variableVal">
            {#each Object.keys(variable.value) as nestedValue}
                <li>
                    <svelte:self variable={variable.value[nestedValue]}/>
                </li>    
            {/each}
        </ul>
    </div>
    {/if}
</main>

