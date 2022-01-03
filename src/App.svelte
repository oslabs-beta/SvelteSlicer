<script>
	import {snapshots, fileTree} from './stores.js';
	import Component from './Component.svelte';
	import TidyTree from './TidyTree.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	//import State from './State.svelte';
	
	let count=0;//control tidt tree render time on the dom. set render condition in TidyTree
	
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

	function selectTree(view){
        selection = view;
		//when button is clicked (function is called)
		count+=1
	}

	
	</script>
	
	<main>
		<p>Svelte Slicer</p>
		<button on:click={() => selectView("componentTree")}>Component Tree</button><button on:click={() => selectView("state")}>State</button><button id="tidy" on:click={()=>selectTree("tidyTree")}>Chart</button>
		<hr>
		{#if view === "componentTree"} 
			<Component component={$fileTree} />
		 	
		{:else if view === "tidyTree"}
		 <!-- <TidyTree treeData={$fileTree} {count}/> -->
		 <TidyTree2 treeData={$fileTree} {count}/>

		{:else if view === "state"}
			{#each $snapshots as snapshot, i}
				<button on:click={() => selectState(i)}>Snapshot {i}</button>
			{/each}
			<hr>
			{#if snapshot} 
				<State component={snapshot}></State>
			{/if}
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
			main {
				max-width: none;
			}
		}
	</style>
	
