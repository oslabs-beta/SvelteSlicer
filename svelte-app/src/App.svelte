<script>
import {snapshots} from './stores.js';

$: runningState = $snapshots.length - 1;

$: selectedState = -1;

$: currentI = (selectedState >= 0 && selectedState < runningState) ? selectedState : runningState;

$: components = $snapshots[currentI];

function selectState(index) {
	selectedState = index;
	console.log('State ' + currentI)
	console.log($snapshots[currentI]);
}
</script>

<main>
	<p>Hello World</p>
	{#each $snapshots as snapshot, i}
	<button on:click={() => selectState(i)}>State {i+1}</button>
	{/each}
	<hr>
	{#if components}
	<h2>State {currentI + 1}</h2>
	<h3>Components</h3>
	<ul>
		{#each Object.keys(components) as component}
			{#if Object.keys(components[component].nodes).length}
				<li>{components[component].tagName}</li>
			{/if}
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
