<script>
import {snapshots} from './stores.js';

function selectState(index) {
	console.log('State ' + index)
	console.log($snapshots[index]);
}
</script>

<main>
	<p>Hello World</p>
	{#each $snapshots as snapshot, i}
	<button on:click={() => selectState(i)}>State {i}</button>
	{/each}
	<hr>
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
