<script>
    export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';

    $: snapshot = $snapshots[I];
    $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);
    

    function clickhandler() {
        console.log(snapshot);
       
    }
   
</script>

<main>
    <button on:click={clickhandler}>Log State</button>
    {#if snapshot && component}
    {#each Object.keys(snapshot.data) as componentName}
        <h3>{componentName}</h3>
    {/each}
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
   
        <ul>
        {#each component.children as child}
            {#if child.active}
                <li>
                    <svelte:self component={child}/>
                </li>
               
            {/if}        
        {/each}
        </ul>
    
    {/if}
    {/if}
</main>