<script>
    import { onMount } from 'svelte';
    export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    let canvas;
    $: snapshot = $snapshots[I];
    $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);
    let stateList = false; 
    const renderedDiffs = {};
    let i = 0;
        function clickhandler() {

        console.log('snapshots no s ', snapshot);
        console.log('snapshots$', $snapshots)
        console.log('snapshot.diff ', snapshot.diff)
        stateList = true;

        // for(let element in snapshot){
        //     if(element === 'diff'){
        //         console.log('snapshots at diff ', snapshot[element])
                //this loop is currently appending text to dom but in the far left corner
                // for(let i = 0; i < snapshot[element].length; i+=1){
                    //start iterating at 1 to avoid initial undefined val
                // for(let i = 0; i < snapshot.diff.length; i+=1){
                // const leDiff = snapshot.diff[i];
                // console.log('leDiff ', leDiff)
                // console.log('old val: ', i, leDiff.oldValue)
                // oldSnapshotVal = leDiff.oldValue
                // console.log('new val: ', i, leDiff.newValue)
                // newSnapshotVal = leDiff.newValue
                

                // const dataSection = document.createElement("SECTION");
                // dataSection.setAttribute("id", "holdsStateData");
                //document.body.appendChild(dataSection);
                //canvas tag --- is this accesbile since declare in below code?
                // document.getElementById("dataContainer").appendChild(dataSection); 

                // const oList = document.createElement("OL");
                //create ol to place li
                // oList.setAttribute("id", "myOl");
                // document.body.appendChild(oList);
                // const listItem = document.createElement('LI')
                // const lBreak = document.createElement('br')
                // dataContainer may need t be creaed before appending dataSection to it
                // let snapShotTextOld = document.createTextNode('Old Value: ' + leDiff.oldValue);
                // let snapShotTextNew = document.createTextNode('New Value: ' + leDiff.newValue);
                // listItem.appendChild(snapShotTextOld);
                // oList.appendChild(lBreak);
                // oList.appendChild(listItem);
                // listItem.appendChild(snapShotTextNew);
                // oList.appendChild(listItem);
    
                // document.getElementById("red").appendChild(oList);
       
                // document.getElementById("red").appendChild(oList)
             
               
            // }
            
            console.log('outof loop')
            }
        
        // }
  
</script>

<main>
   
    <div id="valuesList">
        <h2>Data</h2>
        <button on:click={clickhandler}>Log State/Diffs</button>
        {#if stateList}
            {#each snapshot.diff as diff ,i}
                <ul id="myOl">
                    <li>Component: {diff.component}</li>
                    <br>
                    <li>Variable Name: {diff.name}</li>
                    <br>
                    {#if !diff.oldValue}
                        <li>N/A</li>
                        {:else}
                        <li>Old Value: {diff.oldValue}</li>
                    {/if}
                    <br>
                    <li>New Value: {diff.newValue}</li>
                </ul>
            {/each}
        {/if}
    <!-- <button on:click={outsideClickHandler}>Log State</button> -->
<!--    
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
    {/if} -->
    </div>
    
</main>
 
    
<style>
    
  
</style>
