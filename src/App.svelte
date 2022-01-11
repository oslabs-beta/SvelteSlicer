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

	let showLeft = true
	let showRight = false
	
	</script>
	
	<main id="parent" style="display:flex; height:auto; box-sizing:content-box align-item:center">
		<!-- <div id="left" class="center" style="background-color:#2D3436; height:100%; width:100%; border:solid 3px #F1F3F4; flex:{showLeft?3:0}"> -->
			<div id="left" class="center" style=" border:solid 3px #F1F3F4; height:100%; width:100%; align-items; flex:{showLeft?3:0}">
			<h2>Svelte Slicer</h2>
			<button on:click={() => selectView("componentTree")}>Tree</button><button on:click={() => selectView("state")}>State</button><button id="tidy" on:click={()=>selectTree("tidyTree")}>Chart</button>
			<hr>
			<!-- <label style="color:#F1F3F4; text-align:center"> -->
			<div>
				<span>Visual/Data</span>
				<label class="switch" style=" text-align:center">
				<!-- Toggle Data <input type="checkbox" bind:checked={showRight}> -->
				<input type="checkbox" bind:checked={showRight}>
				<span class="slider round"></span>
				</label> 
			</div>
			
			
			{#if view === "state"}
				{#each $snapshots as snapshot, i}
					<button on:click={() => selectState(i)}>Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</button>
					<br>
				{/each}
				<hr>
			{/if}
		</div>
		
			<div id="right" style="flex:10; display:flex; flex-flow:row">
				<!-- <div id="red" class="center" style="background-color:orangered; height:100%; width:100%; border:solid 3px #F1F3F4; flex:1;"> -->
				<div id="red" class="center" style="height:100%; border:solid 3px #F1F3F4; width:100%; flex:1;">
					<h2>Visual</h2>
					{#if view === "componentTree"} 
					<Component component={$fileTree}/>
					{:else if view === "tidyTree"}
					<TidyTree2 treeData={$fileTree} {count}/>
					{/if}
			</div>
			<!-- <div id="red" class="center" style="background-color:silver; border:solid 3px #F1F3F4; height:100%; width:100%; flex:1;display:{showRight?'flex':'none'};"> -->
				<div id="red" class="center" style=" border:solid 3px #F1F3F4; height:100%; width:100%; flex:1; display:{showRight?'flex':'none'};">
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
			/* max-width: 240px; */
			max-width:max-content;
			margin: 0 auto;
		}
	
		@media (min-width: 640px) {
			main {
				max-width: none;
			}
		}
	
	.switch {
  position: relative;
  /* display: inline-block; */
  display: inline-flexbox;
  width: 40px;
  height: 16px;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  /* content: "visual/data"; */
  content: "";
  height: 13px;
  width: 13px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider.round {
  border-radius: 17px;
}

.slider.round:before {
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
  /* background-color: none; */
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}
	</style>
	
