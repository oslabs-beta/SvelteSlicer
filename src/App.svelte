<script>
	import {snapshots, fileTree, flatFileTree, backgroundPageConnection} from './stores.js';
	import { get } from 'svelte/store';
	import Component from './Component.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	import FileStructure from './FileStructure.svelte';
	import State from './State.svelte';
	import Diffs from './Diffs.svelte';
	import logo from '../extension/devtools/public/images/svelte_slicer_logo_64X64.png';

	
	$: CurrentI = (I !== undefined ? I : $snapshots.length - 1);

	let I;
	let filtered = [];
	let input = "";
	
	let view = "state";
	$: View = view;

	let vis = "tree";
	$: Vis = vis;

	const connection = get(backgroundPageConnection);

	function selectState(index) {
		I = index === $snapshots.length - 1 ? undefined : index;
	}

	function selectView(selection) {
		view = selection;
	}

	function selectVis(selection) {
        vis = selection;
	}

	function jumpState(index) {
		I = index === $snapshots.length - 1 ? undefined : index;
		connection.postMessage({
    		source: 'panel',
			name: 'jumpState',
			index,
			state: $snapshots[index].data,
			tree: $flatFileTree,
			tabId: chrome.devtools.inspectedWindow.tabId
		});
	}

	function filterEventHandler() {
		input = input.trim().toLowerCase();
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

    	$snapshots.forEach((snapshot, index) => {
        	let label = snapshot.label
			label = label.toLowerCase();
    
        	let res = isSubstring(input, label);
			if(res > -1){
				filtered.push({snapshot, index});
			}
		});	
		input = " ";
	}

	function resetFilter() {
		filtered = [];
	}
	
	</script>
	
	<main>
		<div id="mainContainer">
			<div id="title">
				<h2> <img src={logo} id="slicerImg" alt='logo'/> Svelte Slicer</h2> 
			</div>
			<div id="filter">
				<form on:submit|preventDefault={(e) => filterEventHandler(e)} class="form">
					<input type="text" bind:value={input} placeholder="Filter..." name="search" class="search-field" />
					<button type="submit" class="search-button"> 
						<i class="fa fa-search"></i>
					</button>
				</form>
				<button on:click={resetFilter}>Reset</button>
			</div>
			<div id="snapshots">
				{#if !filtered.length}
					{#each $snapshots as snapshot, i}
						<span>Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</span>
								<div class="right-align">
							<button on:click={() => selectState(i)}>Data</button>
							<button on:click={() => jumpState(i)}>Jump</button>
						</div>
						<br>
					{/each}
				{:else if filtered.length}
					{#each filtered as snapshot}
						<span>Snapshot {snapshot.index} {snapshot.snapshot.label ? ' : ' + snapshot.snapshot.label : ''}</span>
						<div class="right-align">
							<button on:click={() => selectState(snapshot.index)}>Data</button>
							<button on:click={() => jumpState(snapshot.index)}>Jump</button>
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
				<!-- <div id="buttons">
					{#if View === "files"}
						<button on:click={() => selectVis("tree")}>Tree</button>
						<button on:click={() => selectVis("chart")}>Chart</button>
					{:else if View === "state"}
						<button on:click={() => selectVis("tree")}>Tree</button>
						<button on:click={() => selectVis("chart")}>Chart</button>
					{/if}
				</div> -->
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
		
	</style>
	
