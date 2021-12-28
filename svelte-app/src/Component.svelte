<script>
    export let component;

    console.log(component);
</script>

<main>
    <p>{component.id}
    {#if component.children.length} 
    <ul>
        {#each component.children as child}
            <li>
                <svelte:self component={child}/>
            </li>
        {/each}
        </ul>
    {/if}

</main>