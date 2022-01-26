<script>
	import {snapshots, fileTree, flatFileTree, backgroundPageConnection} from './stores.js';
	import { get } from 'svelte/store';
	import Component from './Component.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	import FileStructure from './FileStructure.svelte';
	import State from './State.svelte';
	import Diffs from './Diffs.svelte';
	import logo from '../extension/devtools/public/images/svelte_slicer_logo_64X64.png';

	
	$: CurrentI = (I === undefined ? $snapshots.length - 1 : snapshotLength === $snapshots.length ? I : $snapshots.length - 1);
	$: inactive = getInactive(jumpStart, jumpEnd);

	const timeline = [];

	$: {
		if (timeline.length !== $snapshots.length) {
			const latest = $snapshots.length - 1;
			const previous = jumping ? I : latest - 1;
			if (latest === 0) {
				timeline[0] = [0];
			}
			else {
				timeline[latest] = [...timeline[previous], latest]
			}
			console.log(timeline);
			jumping = false;
		}
	}

	let I;
	let filtered = [];
	let input = "";
	let jumping = false;
	let jumpStart;
	let jumpEnd;
	let snapshotLength;
	
	let view = "state";
	$: View = view;

	let vis = "tree";
	$: Vis = vis;

	const connection = get(backgroundPageConnection);

	function getInactive(start, end) {
		const result = [];
		if (start && end) {
			for (let j = start; j <= end; j++) {
				result.push(j);
			}
		}
		return result;
	}

	function selectView(selection) {
		view = selection;
	}

	function selectVis(selection) {
        vis = selection;
	}

	function selectState(index) {
		I = index;
		snapshotLength = JSON.parse(JSON.stringify($snapshots)).length
	}

	function jumpState(index) {
		I = index;
		snapshotLength = JSON.parse(JSON.stringify($snapshots)).length
		jumpStart = index + 1;
		jumpEnd = $snapshots.length - 1;
		jumping = true;
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
						<div class="snapshotList" class:selectedSnapshot="{i === CurrentI}" class:inactiveSnapshot="{!timeline[CurrentI].includes(i)}">
							<span class="snapshotText">Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</span>
							<div class="snapshotButtonGroup">
								<button class="snapshotButton" on:click={() => selectState(i)}>Data</button>
								<button class="snapshotButton" on:click={() => jumpState(i)}>Jump</button>
							</div>
						</div>
					{/each}
				{:else if filtered.length}
					{#each filtered as snapshot}
						<div class="snapshotList" class:selectedSnapshot="{snapshot.index === CurrentI}" class:inactiveSnapshot="{!timeline[CurrentI].includes(snapshot.index)}">
							<span class="snapshotText">Snapshot {snapshot.index} {snapshot.snapshot.label ? ' : ' + snapshot.snapshot.label : ''}</span>
							<div class="snapshotButtonGroup">
								<button class="snapshotButton" on:click={() => selectState(snapshot.index)}>Data</button>
								<button class="snapshotButton" on:click={() => jumpState(snapshot.index)}>Jump</button>
							</div>
						</div>
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
			<div id="clearSnapshots">
				<p>Clear Snapshots</p>
				<div id="clearButtons">
					<button>Previous</button>
					<button>Forward</button>
					<button>Path</button>
				</div>
			</div>
		</div>
	</main>
	
	<style>
		.snapshotText {
	 	 	font-size: 14px;
	  		padding-top: 0.25em;
			padding-bottom: 0.25em;
	  		padding-left: 0.5em;
			margin-top: 0;
			margin-bottom: 0;
  		}

  		.snapshotButton {
	 		font-size: 14px;
			margin-top: 0;
			margin-bottom: 0;
  		}

  		.snapshotList {
		  	display: flex;
	  		align-items: center;
	  		justify-content: space-between;
			padding: 0;
			margin-top:2px;
			margin-bottom: 2px;
			min-height: 60px;
			margin: 0;
  		}

  		.snapshotButtonGroup {
	  		flex-shrink: 0; 
	  		padding-top: 0.25em;
	  		padding-right: 0.5em;
			padding-bottom: 0.25em;
  		}

  		.selectedSnapshot {
	  		background-color:#989797;
			border-bottom: 1px solid rgb(238, 137, 5);
			padding: 0;
			margin: 0;
  		}

		#mainContainer {
			display: grid;
			grid-template-columns: 300px auto;
			grid-template-rows: 50px 50px auto 100px;
			width: 100vw;
  			height: 100vh;
			padding: 0;
			border: 1px solid #dddcdc;
		}

		#snapshots {
			grid-column-start: 1;
			grid-column-end: 2;
			grid-row-start: 3;
			grid-row-end: 4;
			overflow-y: scroll;
			border-top: 1px solid #dddcdc;
			background-color: #757474;
			padding: 0;
			margin: 0;
		}

		#filter {
			grid-column-start: 1;
			grid-column-end: 2;
			grid-row-start: 2;
			grid-row-end: 3;
			padding-top: 0px;
			padding-bottom: 0px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			background-color: #646262;
		}

		#banner {
			grid-column-start: 2;
			grid-column-end: 3;
			grid-row-start: 1;
			grid-row-end: 2;
			border-left: 1px solid #dddcdc;
			display: flex;
			align-items: center;
			background-color: #535151;
		}

		#title {
			grid-column-start: 1;
			grid-column-end: 2;
			grid-row-start: 1;
			grid-row-end: 2;
			display: flex;
			align-items: center;
			background-color: #535151;
		}

		#buttons {
			grid-column-start: 2;
			grid-column-end: 3;
			grid-row-start: 2;
			grid-row-end: 3;
			border-left: 1px solid #dddcdc;
			padding: 1em;
			display: flex;
			align-items: center;
			background-color: #646262;
		}

		#presentation {
			grid-column-start: 2;
			grid-column-end: 3;
			grid-row-start: 3;
			grid-row-end: 5;
			overflow-x: scroll;
			overflow-y: scroll;
			border-top: 1px solid #dddcdc;
			border-left: 1px solid #dddcdc;
			background-color: #757474;
		}

		#clearSnapshots {
			grid-column-start: 1;
			grid-column-end: 2;
			grid-row-start: 4;
			grid-row-end: 5;
			background-color: #646262;
			padding: 0;
		}

		#clearButtons {
			display: flex;
			justify-content: space-evenly;
			padding: 0;
		}

		#slicerImg{
			width: 30px;
			height: 30px;
		}

		.inactiveSnapshot {
			background-color: #cbcbcb;
		}
	</style>
	
