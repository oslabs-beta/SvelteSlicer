<script>
    export let component;
    import Variable from './Variable.svelte';
</script>

<main>
    <h4>{component.tagName}</h4>
    {#if Object.keys(component.variables).length}
        <h5>Variables</h5>
        {#each Object.keys(component.variables) as variable}  
            {#if component.variables[variable].value}  
                <Variable variable={component.variables[variable]}/>
            {/if}
        {/each}
    {/if}
    {#if component.children.length} 
    <ol>
        <ul>
        {#each component.children as child}
            {#if child.active}
                <li>
                    <svelte:self component={child}/>
                </li>
            {/if}        
        {/each}
        </ul>
    </ol>
    {/if}
</main>