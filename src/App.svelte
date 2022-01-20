<script>
	import {snapshots, fileTree} from './stores.js';
	import Component from './Component.svelte';
	//import TidyTree from './TidyTree.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	import FileStructure from './FileStructure.svelte';
	import State from './State.svelte';
	import Diffs from './Diffs.svelte';
	
	$: CurrentI = (I !== undefined ? I : $snapshots.length - 1);

	let I;

	let filtered = [];
	let input = "";
	
	let view = "state";
	$: View = view;

	let vis = "tree";
	$: Vis = vis;

	function selectState(index) {
		I = index === $snapshots.length - 1 ? undefined : index;
		
	}

	function selectView(selection) {
		view = selection;
		filtered = [];
	}

	function selectVis(selection){
        vis = selection;
	}

	function filterState(snapshot){
		let i = $snapshots.indexOf(snapshot);
		selectState(i);
	}

	function filterEventHandler() {
		input = input.trim().toLowerCase();
		console.log("filterInput", input);
		function isSubstring(s1, s2) {
			let S = s1.length;
			let L = s2.length;
    		for (let i = 0; i <= L - S; i++) {
        		let j;
				for (j = 0; j < S; j++) {
					if (s2[i + j] != s1[j]) break;
					}
					if (j == S) return i;
    		}
  			return -1;
		}
    	for (let snapshot of $snapshots) {
        	let label = snapshot.label
			label = label.toLowerCase();
			console.log("label", label);
    
        	let res = isSubstring(input, label);
			if(res > -1){
				filtered.push(snapshot);
			}
	}
	input = " ";
	console.log("filtered", filtered);
}
	
	</script>
	
	<main>
		<div id="mainContainer">
			<div id="title">
				<h2>Svelte Slicer</h2>
			</div>
			<div id="snapshots">
				<div class="filter" style="display:flex; flex-flow:row">
					<form on:submit|preventDefault={(e) => filterEventHandler(e)} class="form">
					  	<input type="text" bind:value={input} placeholder="Filter..." class="search-field" />
					  	<button type="submit" class="search-button">
							<i class="fas fa-search"></i>
					  	</button>
					</form>
				</div>
				{#if !filtered.length}
					{#each $snapshots as snapshot, i}
						<span>Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</span>
						<div class="right-align">
							<button on:click={() => selectState(i)}>Data</button>
						</div>
						<br>
					{/each}
					<hr>
				{:else if filtered.length}
					{#each filtered as snapshot, i}
						<span>Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</span>
						<div class="right-align">
							<button on:click={() => filterState(snapshot)}>Data</button>
						</div>
						<br>
					{/each}
				{/if}
			</div>
			<div id="banner">
				<button on:click={() => selectView("files")}>File Structure</button>
				<button on:click={() => selectView("state")}>State</button>
				<button on:click={() => selectView("diff")}>Diff</button>				
			</div>
			<div id="buttons">
				{#if View === "files"}
					<button on:click={() => selectVis("tree")}>Tree</button>
					<button on:click={() => selectVis("chart")}>Chart</button>
				{:else if View === "state"}
					<button on:click={() => selectVis("tree")}>Tree</button>
					<button on:click={() => selectVis("chart")}>Chart</button>
				{/if}
			</div>
			<div id="presentation">
				{#if $snapshots.length} 
					{#if View === "files" && Vis === "tree"}
						<Component component={$fileTree}/>
					{:else if View === "files" && Vis === "chart"}
						<FileStructure treeData={$fileTree}/>
					<!-- {:else if View === "state" && Vis === "tree"}
						<State I={CurrentI}></State>
					{:else if View === "state" && Vis === "chart"} 
						<TidyTree2 {view} I={CurrentI}/> -->
					{:else if View === "state"}
					   {#if Vis === "tree"}
					    <State I={CurrentI}></State>
						{:else if Vis === "chart"}
                        <TidyTree2 {view} I={CurrentI}/>
						{/if}
					
						


					{:else if View === "diff"}
						<Diffs I={CurrentI}/>
					{/if}
				{/if}
			</div>
		</div>
	</main>
		
		
		
		
		
		
		<!--
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
					{#if view === "componentTree" && $fileTree} 
					<Component component={$fileTree}/>
					{:else if view === "tidyTree" && $fileTree}
					<TidyTree2 treeData={$fileTree} {count} I={CurrentI}/>
					{/if}
			</div>
			<div id="red" class="center" style="background-color:silver; border:solid 3px #F1F3F4; height:100%; width:100%; flex:1;display:{showRight?'flex':'none'};">
					<h2>Data</h2>
				{#if view === "state"}
					{#if data && snapshot && $fileTree} 
						<State I={CurrentI}></State>
						
						<TidyTree2 treeData={$fileTree} {count} I={CurrentI}/>
					{/if}	
				{/if}		
			</div>
		</div>	-->
	
	<style>
		main {
			/* text-align: center; */
			padding: 1em;
			margin: 0 auto;
		}
	
		@media (min-width: 640px) {
			main {
				max-width: none;
			}
		}
	</style>
	
