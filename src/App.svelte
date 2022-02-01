<script>
	import {snapshots, fileTree, flatFileTree, backgroundPageConnection } from './stores.js';
	import { get } from 'svelte/store';
	import Component from './Component.svelte';
	import StateChart from './StateChart.svelte';
	import FileStructure from './FileStructure.svelte';
	import StateTree from './StateTree.svelte';
	import Diffs from './Diffs.svelte';
	import logo from '../extension/devtools/public/images/svelte_slicer_logo_64X64.png';

	
	$: CurrentI = (I === undefined ? $snapshots.length - 1 : snapshotLength < $snapshots.length ? $snapshots.length - 1 : I);
	$: CurrentAppView = (appView === undefined ? $snapshots.length -1 : snapshotLength < $snapshots.length ? $snapshots.length -1 : appView)

	let timeline = [];

	$: {
		if (timeline.length !== $snapshots.length) {
			const latest = $snapshots.length - 1;
			const previous = jumping ? appView : latest - 1;
			if (latest === 0) {
				timeline[0] = [0];
			}
			else {
				timeline[latest] = [...timeline[previous], latest]
			}
			jumping = false;
		}
	}

	let I;
	let appView;
	let filtered = [];
	let input = "";
	let jumping = false;
	let snapshotLength;
	
	let view = "state";
	$: View = view;

	let vis = "tree";
	$: Vis = vis;

	const connection = get(backgroundPageConnection);

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
		appView = index;
		snapshotLength = JSON.parse(JSON.stringify($snapshots)).length
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
	
	function clearSnapshots(clearType) {
		let newSnapshotList;
		let path = timeline[CurrentAppView].slice();
		if (clearType === 'forward') {
			newSnapshotList = $snapshots.slice(0, CurrentAppView + 1);
			timeline = timeline.slice(0, CurrentAppView + 1);
		}
		else if (clearType === 'previous') {
			newSnapshotList = $snapshots.slice(CurrentAppView);
			let count = CurrentAppView;
			timeline = timeline.slice(CurrentAppView);
			timeline.forEach(snapshot => {
				for (let i = snapshot.length - 1; i >= 0; i--) {
					const newValue = snapshot[i] - count;
					if (newValue >= 0) {
						snapshot[i] = newValue;
					}
					else {
						snapshot.splice(i, 1);
					}
				}
			})
			appView = appView - count;
			I = I - count;
		}
		else if (clearType === 'path') {
			newSnapshotList = $snapshots.slice();
			for (let i = $snapshots.length -1; i > 0 ; i-=1){
				if(!path.includes(i)){
					newSnapshotList.splice(i,1);
					timeline.splice(i, 1);
				}
			}
			timeline.forEach((snapshot, snapshotIndex) => {
				snapshot.splice(0, snapshot.length);
				for (let i = 0; i <= snapshotIndex; i++) {
					snapshot.push(i);
				}
			})
			console.log(timeline);
		}
		
		snapshots.set(newSnapshotList)
		
		connection.postMessage({
			source: 'panel',
			name: 'clearSnapshots',
			clearType,
			index: CurrentAppView,
			path,
			tabId: chrome.devtools.inspectedWindow.tabId
		})
	}

	</script>
	
	<main>
		<div id="mainContainer">
			<div id="title">
				<img src={logo} id="slicerImg" alt='logo'/>
				<h2 id="titleText">Svelte Slicer</h2> 
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
						<div class="snapshotList" class:selectedSnapshot="{i === CurrentAppView}" class:inactiveSnapshot="{!timeline[CurrentAppView].includes(i)}">
							<span class="snapshotText">Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</span>
							<div class="snapshotButtonGroup">
								<button class="snapshotButton" on:click={() => selectState(i)} class:selectedButton="{i === CurrentI}">Data</button>
								<button class="snapshotButton" on:click={() => jumpState(i)}>Jump</button>
							</div>
						</div>
					{/each}
				{:else if filtered.length}
					{#each filtered as snapshot}
						<div class="snapshotList" class:selectedSnapshot="{snapshot.index === CurrentAppView}" class:inactiveSnapshot="{!timeline[CurrentAppView].includes(snapshot.index)}">
							<span class="snapshotText">Snapshot {snapshot.index} {snapshot.snapshot.label ? ' : ' + snapshot.snapshot.label : ''}</span>
							<div class="snapshotButtonGroup">
								<button class="snapshotButton" on:click={() => selectState(snapshot.index)} class:selectedButton="{snapshot.index === CurrentI}">Data</button>
								<button class="snapshotButton" on:click={() => jumpState(snapshot.index)}>Jump</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
			<div id="banner">
				<button on:click={() => selectView("files")} class:activeButton="{view === "files"}">Components</button>
				<button on:click={() => selectView("state")} class:activeButton="{view === "state"}">State</button>			
			</div>
			<div id="buttons">
				{#if View === "files"}
					<button on:click={() => selectVis("tree")} class:activeButton="{vis === "tree"}">Tree</button>
					<button on:click={() => selectVis("chart")} class:activeButton="{vis === "chart"}">Chart</button>
				{:else if View === "state"}
					<button on:click={() => selectVis("tree")} class:activeButton="{vis === "tree"}">Tree</button>
					<button on:click={() => selectVis("chart")} class:activeButton="{vis === "chart"}">Chart</button>
					<button on:click={() => selectVis("diff")} class:activeButton="{vis === "diff"}">Diff</button>	
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
					    <StateTree I={CurrentI}/>
						{:else if Vis === "chart"}
                        <StateChart {view} I={CurrentI}/>
						{:else if Vis === "diff"}
						<Diffs I={CurrentI}/>
						{/if}
					{/if}
				{/if}
			</div>
			<div id="clearSnapshots">
				<h6 class='clearSnapshotHeader'>Clear Snapshots</h6>
				<div id="clearButtons">
					<button class='clearButton' on:click={() => clearSnapshots('previous')}>Previous</button>
					<button class='clearButton' on:click={() => clearSnapshots('path')}>Path</button>
					<button class='clearButton' on:click={() => clearSnapshots('forward')}>Forward</button>
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
			grid-template-rows: 50px 50px auto 85px;
			width: 100vw;
  			height: 100vh;
			padding: 0;
			border: 2px solid #dddcdc;
		}

		#snapshots::-webkit-scrollbar {
			width: 10px;
		}

		#snapshots::-webkit-scrollbar-track {
		background-color: rgba(238, 137, 5, 0.288);
		border-radius: 100px;
		}

		#snapshots::-webkit-scrollbar-thumb {
		border-radius: 100px;
		border: 5px solid transparent;
		background-clip: content-box;
		background-color: none;
		}

		#snapshots {
			grid-column-start: 1;
			grid-column-end: 2;
			grid-row-start: 3;
			grid-row-end: 4;
			overflow-y: scroll;
			border-top: 2px solid #dddcdc;
			background-color: #75747400;
			margin: 0;
			padding: 0;
			overflow-y: auto;
			direction: ltr;
			scrollbar-color: #d4aa70 #e4e4e4;
			scrollbar-width: thin;
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
			border-left: 2px solid #dddcdc;
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
			border-left: 2px solid #dddcdc;
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
			border-top: 2px solid #dddcdc;
			border-left: 2px solid #dddcdc;
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
			justify-content: center;
			padding: 0;
			margin: 0px;

		}

		.clearButton {
			background-color: transparent;
			font-size: 14px;
			border: 1px solid rgb(238, 137, 5);
			margin-left: 10px;
			margin-right: 10px;

		}

		.clearSnapshotHeader {
			text-align: center;
			font-size: 16px;
			margin: 0px;
			padding: 10px;
		}

		#slicerImg{
			width: 30px;
			height: 30px;
			margin-right: 10px;
		}

		.inactiveSnapshot {
			background-color: #cbcbcb;
		}

		#titleText {
			padding-top: 5px;
			margin: 0;
		}

		.selectedButton {
			background-color: rgb(238, 137, 5);
		}

		.activeButton {
			border: 1px solid rgb(238, 137, 5);
		}
	</style>
	
