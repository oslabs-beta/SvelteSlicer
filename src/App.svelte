<script>
	import {snapshots, fileTree, backgroundPageConnection} from './stores.js';
	import Component from './Component.svelte';
	import { get } from 'svelte/store';
	//import TidyTree from './TidyTree.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	import State from './State.svelte';

	let count=0;//control tidt tree render time on the dom. set render condition in TidyTree

	$: snapshot = $snapshots[CurrentI];
	$: data = (snapshot ? snapshot.data : undefined);
	$: parent = (snapshot ? snapshot.parent : undefined);
	$: CurrentI = (I !== undefined ? I : $snapshots.length - 1);

	let I;
	let prevI;
	
	$: view = selection;
	let selection;

	const connection = get(backgroundPageConnection);

	function selectState(index) {
		I = index === $snapshots.length - 1 ? undefined : index
	}
	
	function rerenderState(index) {
		prevI = CurrentI;
		I = index === $snapshots.length - 1 ? undefined : index
		connection.postMessage({
    		source: 'panel',
			name: 'rerenderState',
    		index,
			parent,
			state: $snapshots[index].data,
			prevI,
			tabId: chrome.devtools.inspectedWindow.tabId
		});
	}
	
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
					<p style="color: white">Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</p>
					<button on:click={() => selectState(i)}>Data</button>
					<button on:click={() => rerenderState(i)}>Render</button>
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
					{#if data} 
						<State component={data[parent]}></State>
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
	
