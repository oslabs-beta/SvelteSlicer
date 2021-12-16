<script>
    export let component;
</script>

<main>
    <p>{component.id}
    {#if component.children.length} 
    <ul>
        {#each component.children as child}
            {#if child.active}
                <li>
                    <svelte:self component={child}/>
                </li>
            {/if}        
        {/each}
        </ul>
    {/if}
</main>