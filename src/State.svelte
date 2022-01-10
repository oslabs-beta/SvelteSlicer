<script>
    export let I;
    export let oldSnapshotVal = '';
    export let newSnapshotVal = '';
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
 
    $: snapshot = $snapshots[I];
    $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);

    function clickhandler() {
       
        console.log('snapshots no s', snapshot);
        console.log('snapshots$', $snapshots)
        for(let element in snapshot){
            if(element === 'diff'){
                console.log('snapshots at diff ', snapshot[element])

                //need to grab the arr to prevent looping thr entire snapshot ob
            // for(let i = 0; i < snapshot[element].length; i+=1){
                //this loop is currently appending text to dom but in the far right corner
                for(let i = 0; i < snapshot[element].length; i+=1){
         
                // if(i <= 2){
                 const oList = document.createElement("OL");
                 //create  div to place li
                oList.setAttribute("id", "myOl");
                document.body.appendChild(oList);
                const listItem = document.createElement('LI')
                
                let snapShotText = document.createTextNode(snapshot[element][i].newValue)
                // listItem.appendChild(snapShotText);
                const lBreak = document.createElement('br')
                listItem.appendChild(snapShotText);
                document.getElementById("myOl").appendChild(snapShotText)
                snapshot.appendChild(lBreak)
                
                console.log('text ', i, snapshot[element][i].name)
                console.log('old val ', i, snapshot[element][i].oldValue)
                oldSnapshotVal = snapshot[element][i].oldValue
                console.log('new val ', i, snapshot[element][i].newValue)
                newSnapshotVal = snapshot[element][i].newValue
                // console.log('text ', i, snapshot[element][i].name)
                // console.log('new val ', i, snapshot[element][i].newValue)
                // console.log('old val ', i, snapshot[element][i].oldValue)
                
                }
                break;
               
            }
            
            console.log('outof loop')
            }
            
           
        }
        
    }

</script>

<main>
    <button on:click={clickhandler}>Log State</button>
    
    {#if snapshot && component}
    <h3>{snapshot.label}</h3>
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
        {/each}
        </ul>
    </ol>
    {/if}
    {/if}
</main>