<script>
    import { onMount } from 'svelte';
    export let I;
    export let oldSnapshotVal = '';
    export let newSnapshotVal = '';
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    let canvas;
    $: snapshot = $snapshots[I];
    $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);
    let outsideClickHandler; 
    
    // onMount(() => {

         function clickhandler() {

        // outsideClickHandler = () => {
       
        console.log('snapshots no s', snapshot);
        console.log('snapshots$', $snapshots)
        for(let element in snapshot){
            if(element === 'diff'){
                console.log('snapshots at diff ', snapshot[element])

                //this loop is currently appending text to dom but in the far left corner
                for(let i = 0; i < snapshot[element].length; i+=1){
                    
                // console.log('text ', i, snapshot[element][i].name)
                console.log('old val: ', i, snapshot[element][i].oldValue)
                oldSnapshotVal = snapshot[element][i].oldValue
                console.log('new val: ', i, snapshot[element][i].newValue)
                newSnapshotVal = snapshot[element][i].newValue
                // console.log('text ', i, snapshot[element][i].name)
                // console.log('new val ', i, snapshot[element][i].newValue)
                // console.log('old val ', i, snapshot[element][i].oldValue)

                const dataSection = document.createElement("SECTION");
                dataSection.setAttribute("id", "holdsStateData");
                document.body.appendChild(dataSection);
                //canvas tag --- is this accesbile since declare in below code?
                // document.getElementById("dataContainer").appendChild(dataSection); 

                const oList = document.createElement("OL");
                //create ol to place li
                oList.setAttribute("id", "myOl");
                // document.body.appendChild(oList);
                const listItem = document.createElement('LI')
                const lBreak = document.createElement('br')
                // dataContainer may need t be creaed before appending dataSection to it
                let snapShotText = document.createTextNode('new Val ' + snapshot[element][i].newValue + ' old Val ' + snapshot[element][i].oldValue)
                listItem.appendChild(snapShotText);
                oList.appendChild(listItem);
                document.getElementById("holdsStateData").appendChild(oList)
                // listItem.appendChild(lBreak);
                // dataSection.appendChild(oList);
                
                // dataSection.appendChild(listItem)
                // document.body.appendChild(holdsData);
                
                }
                break;
               
            }
            
            console.log('outof loop')
            }
        
        }
  
</script>

<main>
    <!-- give button an id and append chandler to it -->
    <!-- <button on:click={clickhandler}>Log State</button> -->
    <button  on:click={clickhandler}>Log State</button>
    <!-- <button on:click={outsideClickHandler}>Log State</button> -->
   
    {#if snapshot && component}
    <h3>{snapshot.label.slice(0,13)} </h3> 
    

    <h4>{component.tagName}</h4>
    {#if Object.keys(component.variables).length}
        <h5>Variables</h5>
      
        {#each Object.keys(component.variables) as variable}  
            {#if component.variables[variable].value}  
                <Variable variable={component.variables[variable]}/>
            {/if}
        {/each}
       
    {/if}

    {#if component.children.length} 
    <ol>
        <ul>
        {#each component.children as child}
            {#if child.active}
                <li>
                    <svelte:self component={child}/>
                </li>
                
            {/if}   
            <canvas id="dataContainer"
                bind:this={canvas}
                width={50}
                height={50}>
        
            </canvas>     
        {/each}
        </ul>
    </ol>
    {/if}
    {/if}
</main>
 
    
<style>
    
    canvas {
		width: 50%;
		height: 50%;
		background-color: rgb(14, 158, 146);
		/* -webkit-mask: url(/svelte-logo-mask.svg) 50% 50% no-repeat;
		mask: url(/svelte-logo-mask.svg) 50% 50% no-repeat; */
	}
</style>
