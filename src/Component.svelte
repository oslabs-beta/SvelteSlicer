<script>
    export let component;

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
    <!-- <p>{component.id}
    {#if component.children.length} 
    <ul>
        {#each component.children as child}
            <li>
                <svelte:self component={child}/>
            </li>
        {/each}
        </ul>
    {/if} -->
    <ul><!-- transition:slide -->
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
    </ul>

</main>

<style>
	/* ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
	}
	.no-arrow { padding-left: 1.0rem; } */
	
</style>