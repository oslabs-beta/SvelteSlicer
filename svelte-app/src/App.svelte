<script>
import {snapshots} from './stores.js';
import Component from './Component.svelte';

$: snapshot = $snapshots[CurrentI];
let CurrentI;

function selectState(index) {
	CurrentI = index;
	console.log(CurrentI);
}
</script>

<main>
	<p>Svelte Slicer</p>
	{#each $snapshots as snapshot, i}
	<button on:click={() => selectState(i)}>State {i}</button>
	{/each}
	<hr>
	{#if snapshot} 
		<Component component={snapshot}></Component>
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
