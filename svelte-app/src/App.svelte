<script>
import {snapshots} from './stores.js';

let currentI = $snapshots.length - 1;

$: components = $snapshots[currentI];

function setCurrentState(index) {
	console.log(index);
	currentI = index;
}
</script>

<main>
	<p>Hello World</p>
	{#each $snapshots as snapshot, i}
	<button on:click={() => setCurrentState(i)}>State {i+1}</button>
	{/each}
	<hr>
	{#if components}
	<h2>Components</h2>
	<ul>
		{#each Object.keys(components) as component}
		<li>{components[component].tagName}</li>
		{/each}
	</ul>
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
