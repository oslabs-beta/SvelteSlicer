<script>
	import {snapshots, fileTree} from './stores.js';
	import Component from './Component.svelte';
	import Header from './Header.svelte';
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
							<input type="text" bind:value={input} placeholder="Filter..." name="search" class="search-field" />
						<button type="submit" class="search-button"> 
								<i class="fa fa-search"></i>
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
					<!-- <hr> -->
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
			
			<div id="presentation">
				<div id="buttons">
					{#if View === "files"}
						<button on:click={() => selectVis("tree")}>Tree</button>
						<button on:click={() => selectVis("chart")}>Chart</button>
					{:else if View === "state"}
						<button on:click={() => selectVis("tree")}>Tree</button>
						<button on:click={() => selectVis("chart")}>Chart</button>
					{/if}
				</div>
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
	
	<style>
		


		.search-button {
			color: rgb(162, 159, 159);
			background: transparent;
			border: none;
			outline: none;
			margin-right: -35px;
		}

		form.form button:hover {
  		background: rgb(238, 137, 5);
		
		}
		
		/* @media (min-width: 640px) {
			main {
				max-width: none;
			

			}
			
		} */


			/* } */
		/* } */

	</style>
	
