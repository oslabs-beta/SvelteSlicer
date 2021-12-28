<script>
    export let component;
<<<<<<< HEAD
    
    console.log("component.children",component.children);
    console.log('hierarchical data for tidy tree',component)
=======

    console.log(component);
>>>>>>> script-injection
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