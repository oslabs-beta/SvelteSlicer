<script>
<<<<<<< HEAD
import {snapshots, fileTree} from './stores.js';
import Component from './Component.svelte';
import TidyTree from './TidyTree.svelte';


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
	<p>Svelte Slicer</p>
	<button on:click={() => selectView("componentTree")}>Component Tree</button><button on:click={() => selectView("state")}>State</button>
	<hr>
	{#if view === "componentTree"} 
		<Component component={$fileTree}/>
		<TidyTree treeData={$fileTree}/>
	{:else if view === "state"}
		{#each $snapshots as snapshot, i}
			<button on:click={() => selectState(i)}>Snapshot {i}</button>
		{/each}
=======
	import {snapshots, fileTree} from './stores.js';
	import Component from './Component.svelte';
	import TidyTree from './TidyTree.svelte';
	import State from './State.svelte';
	
	
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
		<p>Svelte Slicer</p>
		<button on:click={() => selectView("componentTree")}>Component Tree</button><button on:click={() => selectView("state")}>State</button>
>>>>>>> script-injection
		<hr>
		{#if view === "componentTree"} 
			<Component component={$fileTree}/>
			<TidyTree treeData={$fileTree}/>
		{:else if view === "state"}
			{#each $snapshots as snapshot, i}
				<button on:click={() => selectState(i)}>Snapshot {i}</button>
			{/each}
			<hr>
			{#if snapshot} 
				<State component={snapshot}></State>
			{/if}
		{/if}
<<<<<<< HEAD
	{/if}

	
</main>

<style>
	main {
		/* text-align: center; */
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
=======
	
		
	</main>
	
	<style>
>>>>>>> script-injection
		main {
			/* text-align: center; */
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
	
