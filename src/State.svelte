<script>
    export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';

    $: snapshot = $snapshots[I];
    $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);
    

    function clickhandler() {
        console.log("snap,",snapshot);
        console.log('parent',parent)
        console.log('comp',component)
       
    }
    function helper(s){
      let obj = {}
        Object.keys(s).forEach(item=>{
            if(!obj[item].tagName){
                obj.id = obj[item].tagName;
                obj.children = obj[item].variables
            }
        })
    }
    // const _expansionState = {
	// 	/* expanded <boolean> */
	// }
    // const {id}=snapshot.data
    // let expanded = _expansionState[snapshot] || false
    // const toggleExpansion = () => {
	// 	expanded = _expansionState[id] = !expanded
	// }
    // $: arrowDown = expanded
   
</script>

<main>
    <button on:click={clickhandler}>Log State</button>
    
{#if snapshot && component}
<h2>{snapshot.label}</h2>
    {#each Object.keys(snapshot.data) as componentName} 
        {#if Object.keys(snapshot.data[componentName].variables).length>0 && snapshot.data[componentName].active}
           
        <!-- <span on:click={toggleExpansion} id={componentName}>
            <span class="arrow" class:arrowDown>&#x25b6</span>
            {#each Object.keys(snapshot.data[componentName].variables) as variable}  
            {#if snapshot.data[componentName].variables[variable].value}  
            <Variable variable={snapshot.data[componentName].variables[variable]}/>
            {/if}
       {/each}
            
        </span> -->
           <!-- <h3>{snapshot.data[componentName].tagName}</h3> -->
           <h3>--{componentName}</h3>
           {#each Object.keys(snapshot.data[componentName].variables) as variable}  
                {#if snapshot.data[componentName].variables[variable].value}  
                <Variable variable={snapshot.data[componentName].variables[variable]}/>
                {/if}
           {/each}
            
            
        {/if}
           
           
    {/each}
          

    <!-- {#if Object.keys(component.variables).length > 0}
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
    
    {/if} -->
{/if}
</main>