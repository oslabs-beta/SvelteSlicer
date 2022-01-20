<script>
 
    export let component;
    // import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    // $: snapshot = $snapshots[I];
    // $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    // $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);
    // // console.log('data  ', data)
    console.log('data paret ', component)
    // console.log('data paret.text ', data[parent].text)
    console.log('data paret ', component.children)
    console.log('component chilren text', component.children.text)
    
    // console.log('component var', component.variables)
    let stateList = false; 
    // let stateList = false; 
    // const renderedDiffs = {};
    // let i = 0;
        function clickhandler() {

    //     console.log('snapshots no s ', snapshot);
    //     console.log('snapshots$', $snapshots)
    //     console.log('snapshot.diff ', snapshot.diff)
        stateList = true;

      
            }

  
</script>

<main>

    <h4>{component.tagName}</h4> 
    {#if Object.keys(component.variables).length}
        <h5>Variables</h5>
        {#each Object.keys(component.variables) as variable}  
            {#if component.variables[variable].value}  
                <Variable variable={component.variables[variable]}/>
            {/if}
        {/each}
    {/if}
    <!-- {/if} -->
    {#if component.children.length} 
    <ol>
        <!-- <ul> -->
             <li > 
        {#each component.children as child}
            {#if child.active}
                              
                        <svelte:self component={child}/>
 ]                 
               
               
            {/if}       
        {/each} 
    
    </li>
        <!-- </ul> -->
    </ol>
    {/if} 
    <!-- {/if} -->
    
</main>
 
    
<style>
    
  
</style>
