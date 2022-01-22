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
   <div>
       <ul>
        <li>
            {#if children.length}
                <span on:click={toggleExpansion} id={id}>
                    <span class="arrow" class:arrowDown>&#x25b6</span>
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
   </div>
    

</main>



