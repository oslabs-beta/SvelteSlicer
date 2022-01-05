<script>
    export let component;
    
    console.log("component.children",component.children);
    console.log('hierarchical data for tidy tree',component)

    const _expansionState = {
		/* treeNodeId: expanded <boolean> */
	}
    const {id, children} = component;

    let expanded = _expansionState[id] || false
	const toggleExpansion = () => {
		expanded = _expansionState[id] = !expanded
	}
	$: arrowDown = expanded
</script>

<main>
   
    <ol>
        <li>
            {#if children}
                <span on:click={toggleExpansion}>
                    <i class="fas fa-arrow-down"></i>
                    {id}
                </span>
                {#if expanded}
                    {#each children as child}
                        <svelte:self component={child} />
                    {/each}
                {/if}
            {:else}
                <span>
                    <span class="no-arrow"/>
                    {id}
                </span>
            {/if}
        </li>
    </ol>

</main>

