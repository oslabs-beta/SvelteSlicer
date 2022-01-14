<script>
	import {snapshots, fileTree} from './stores.js';
	import Component from './Component.svelte';
	import Header from './Header.svelte';
	import Tabs from './Header.svelte';
	//import TidyTree from './TidyTree.svelte';
	import TidyTree2 from './TidyTree2.svelte';
	import State from './State.svelte';

	let count=0;//control tidt tree render time on the dom. set render condition in TidyTree
	let tabLinks = ['Home', 'Visual', 'Data'];
	let clickedTab = 'Home'
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
	<Header/>
	<!-- border:solid 1px #F1F3F4;  -->
		<main id="parent" style="height:auto;  border: 1px solid whitesmoke align-item:center">
			<div id="left" class="flex-grid panelDiv" style=" height:100%; width:100%; align-items; flex:{showLeft?2:0}">
				<div>
					<!-- <button on:click={() => selectView("componentTree")}>Tree</button> -->
					<!-- <button on:click={() => selectView("state")}>State Snapshot</button> -->
					<button class="optionButtons" on:click={() => selectView("state")}>State Snapshot</button>
					<button on:click={() => selectView("componentTree")}>Tree</button>
					<button  on:click={()=>selectTree("data")}>Data</button>
					<!-- <button id="tidy" on:click={()=>selectTree("tidyTree")}>Diff</button> -->
					<button id="tidy" on:click={()=>selectTree("tidyTree")}>Chart</button>
					<h6>Visual/Data</h6>
					<label class="switch" style=" text-align:center">
						<input type="checkbox" bind:checked={showRight}>
						<span class="slider round"></span>
					</label> 
				</div>
				
			
			<div id="right" style="display:flex;">
				<div class="col panelDiv" style="height:fit-content; flex:1;">
					
					{#each $snapshots as snapshot, i}
						<button on:click={() => selectState(i)}>Snapshot {i} {snapshot.label ? ' : ' + snapshot.label : ''}</button>
						<br>
					{/each}
					<!-- {/if}	 -->
					
					<!-- {#if view === "componentTree"} 
					<h2>Visual</h2>
					<Component component={$fileTree}/>
					{:else if view === "tidyTree"}
					
					
					<TidyTree2 treeData={$fileTree} {count}/> -->
					<!-- set conditional for tidy tree versus data -->
					<!-- {:else if view !== "tidyTree"}
					{:else} -->

					<!-- {:else if view === 'data'}
					<h2>Data</h2> -->
					<!-- {#if view === "state"}
						{#if data && snapshot}  -->
						<!-- <State I={CurrentI}></State> -->
						<!-- {/if}	
					{/if}		 -->
					<!-- {/if} -->
				<!-- </div> -->
			</div>
				<div id="red" class="col panelDiv" style="  height:100%;  align-items: right; display:{showRight?'flex':'none'};">
					<!-- {#if view === 'data'}
					<h2>Data</h2>
					 {#if view === "state"}
						{#if data && snapshot}  -->
							<!-- <State I={CurrentI}></State> -->
						<!-- {/if}	
					{/if}		 -->
					
				<!-- </div> -->


				{#if view === "componentTree"} 
					<h2>Visual</h2>
					<Component component={$fileTree}/>
					{:else if view === "tidyTree"}
					<TidyTree2 treeData={$fileTree} {count}/>

					{:else if view === 'state'}
					
				
					<State I={CurrentI}></State>
				
					{/if}
		</div>
	
	</main>
	
	<style>
		main {
			/* text-align: center; */
			padding: 1em;
			/* max-width: 240px; */
			max-width:max-content;
			margin: 10px auto;
			align-items: center;
			color: whitesmoke;
			background: rgb(83, 81, 81);
		}
	
		@media (min-width: 640px) {
			main {
				max-width: none;
			

			}
			.flex-grid {
				display: block;
			}
		}

		/* .optionButtons {

		} */

	.flex-grid-half  {
		width: 50%;
		align-items: center;
		padding: 2px;
		margin: 2px;
	}
	.col {
		flex: 1;
		width:max-content;
	} 
	.switch {
  position: relative;
  /* display: inline-block; */
  display:flexbox;
  width: 47px;
  height: 21px;
  margin: 1px;
}

.slider {
  /* position: absolute; */
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  -webkit-tap-highlight-color: transparent;
  outline:#2196F3;
	margin:1px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  /* content: "visual/data"; */
  content: "";
  height: 17px;
  width: 20px;
  left: 7px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  align-items: center;
}

.slider.round {
  border-radius: 30px;
  
}


.slider.round:before {
  border-radius: 50%;
}

input:checked + .slider {
  background-color: teal;
  /* background-color: none; */
}

input:focus + .slider {
  box-shadow: 0 0 2px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(23px);
  -ms-transform: translateX(23px);
  transform: translateX(23px);
}
	</style>
	
