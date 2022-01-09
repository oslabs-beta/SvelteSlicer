<script>
	import {snapshots, fileTree} from './stores.js';
	import Component from './Component.svelte';
	//import TidyTree from './TidyTree.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	import State from './State.svelte';
	
   
	let count=0;//control tidt tree render time on the dom. set render condition in TidyTree
	
    
	$: snapshot = $snapshots[CurrentI];
	$: data = (snapshot ? snapshot.data : undefined);

	let CurrentI;
	
	$: view = selection;
	let selection;
	
	function selectState(shot,index) {
		CurrentI = index;
	}
	$: dataForSelected = selectState()  
	console.log('out data',dataForSelected)
	function selectView(view) {
		selection = view;
	}

	function selectTree(view){
        selection = view;
		//when button is clicked (function is called)
		count+=1
	}

	let showLeft = true
	let showRight = true
	
	</script>
	
	<main id="parent" style="display:flex; height:auto; box-sizing:content-box">
		<div id="left" class="center" style="background-color:#2D3436; height:100%; width:100%; border:solid 3px #F1F3F4; flex:{showLeft?3:0}">
			<h2>Svelte Slicer</h2>
			<button on:click={() => selectView("componentTree")}>Component Tree</button><button on:click={() => selectView("state")}>State</button><button id="tidy" on:click={()=>selectTree("tidyTree")}>Chart</button>
			<hr>
			<label style="color:#F1F3F4; text-align:center">
			Reduce LeftPanel <input type="checkbox" bind:checked={showLeft}>
			</label>
			<label style="color:#F1F3F4; text-align:center">
			Toggle Data <input type="checkbox" bind:checked={showRight}>
			</label>
			{#if view === "state"}
				{#each $snapshots as snapshot, i}
					<button on:click={() => selectState(snapshot,i)}>Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</button>
					<br>
				{/each}
				<hr>
			{/if}
		</div>
		
			<div id="right" style="flex:10; display:flex; flex-flow:row">
				<div id="red" class="center" style="background-color:orangered; height:100%; width:100%; border:solid 3px #F1F3F4; flex:1;">
					<h2>Visual</h2>
					{#if view === "componentTree"} 
					<Component component={$fileTree}/>
					{:else if view === "tidyTree"}
					<TidyTree2 treeData={$fileTree} {count}/>
					{/if}
			</div>
			<div id="red" class="center" style="background-color:silver; border:solid 3px #F1F3F4; height:100%; width:100%; flex:1;display:{showRight?'flex':'none'};">
					<h2>Data</h2>
				{#if view === "state"}
					{#if data && snapshot} 
						<State I={CurrentI}></State>
					{/if}	
				{/if}		
			</div>
		</div>	
			
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
	
