<script>
import {snapshots, fileTree} from './stores.js';
import ComponentTree from './ComponentTree.svelte';
import Component from './Component.svelte';

$: snapshot = $snapshots[CurrentI];
let CurrentI;

$: view = selection;
let selection;

function selectState(index) {
	CurrentI = index;
}

function selectView(view) {
	selection = view;
}

</script>

<main>
	<h2>Svelte Slicer</h2>
	<button on:click={() => selectView("componentTree")}>Component Tree</button><button on:click={() => selectView("state")}>State</button>
	<hr>
	{#if view === "componentTree"} 
		<ComponentTree testing={$fileTree}/>
	{:else if view === "state"}
		{#each $snapshots as snapshot, i}
			<button on:click={() => selectState(i)}>Snapshot {i}</button>
		{/each}
		<hr>
		{#if snapshot} 
			<Component component={snapshot}/>
		{/if}
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
