<script>
    export let testing;
    const _expansionState = {
		/* treeNodeId: expanded <boolean> */
	}
    const {label, children} = testing;

    let expanded = _expansionState[label] || false
	const toggleExpansion = () => {
		expanded = _expansionState[label] = !expanded
	}
	$: arrowDown = expanded
</script>

<ul><!-- transition:slide -->
	<li>
		{#if children}
			<span on:click={toggleExpansion}>
				<i class="fas fa-arrow-down"></i>
				{label}
			</span>
			{#if expanded}
				{#each children as child}
					<svelte:self testing={child} />
				{/each}
			{/if}
		{:else}
			<span>
				<span class="no-arrow"/>
				{label}
			</span>
		{/if}
	</li>
</ul>

<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
	}
	.no-arrow { padding-left: 1.0rem; }
	
</style>