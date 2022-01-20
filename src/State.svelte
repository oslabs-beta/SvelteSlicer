<script>
    import { onMount } from 'svelte';
    export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    let canvas;
    $: snapshot = $snapshots[I];
    $: parent = (I !== undefined ? $snapshots[I].parent : undefined);
    $: component = (I !== undefined ? $snapshots[I].data[parent] : undefined);
    

    let collapse = document.getElementsByClassName("collapsible");
    let i;
    //let opened = collapse[i] || false;
    function collapsible(){
 
    for (i = 0; i < collapse.length; i++) {
    
        this.classList.toggle("active");
     
        let content = this.nextElementSibling.nextElementSibling;
        if (content.style.display === "block") {
     
        content.style.display = "none";
        } else {
     
        content.style.display = "block";
        }
    
    }
    //opened =collapse[i]= !opened
    }
    $: arrowDown = true
    
</script>

<main>
{#if snapshot && component}
<h2>{snapshot.label}</h2>
    {#each Object.keys(snapshot.data) as componentName} 
        {#if Object.keys(snapshot.data[componentName].variables).length>0 && snapshot.data[componentName].active}
           
        
          
           
            <!-- {#if snapshot.data[componentName].instance == 0} -->
           <span class="collapsible"  on:click={collapsible}>
           
           
            <span class="arrow" class:arrowDown> &#x25b6</span>
            {snapshot.data[componentName].tagName}
            
           
            
          </span>
           <br/>
           <div class="content">
              
                {#each Object.keys(snapshot.data[componentName].variables) as variable}  
                   {#if snapshot.data[componentName].variables[variable].value !==undefined && snapshot.data[componentName].variables[variable].value !== null}  
                
                      <Variable variable={snapshot.data[componentName].variables[variable]}/>
                
                   {/if}
                {/each}
             
          </div>
          <!-- {:else}
          <span class="collapsible" on:click={collapsible}>
           
            
            
            --{componentName}
            
          </span>
           <br/>
           <div class="content">
              
                {#each Object.keys(snapshot.data[componentName].variables) as variable}  
                   {#if snapshot.data[componentName].variables[variable].value}  
                
                      <Variable variable={snapshot.data[componentName].variables[variable]}/>
                
                   {/if}
                {/each}
             
          </div>

          {/if} -->
          
            
            
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
            <canvas id="dataContainer"
                bind:this={canvas}
                width={50}
                height={50}>
        
            </canvas>     
        {/each}
        </ul>
    
    {/if} -->
{/if}
</main>

<style>
  .collapsible {
  /* background-color: #777;
  color: white; */
  cursor: pointer;
  display: inline-block;
  /* padding: 18px; */
  /* width: 100%; */
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
  font-family: 'Comic Sans MS', cursive;
}

.collapsible:hover {
  background-color: rgb(238, 137, 5);
}

 /* .collapsible:after {
  content: '\25b6';
  color: white;
  font-weight: bold;
  float: right;
  margin-left: 5px;
} */

/* .active {
  content: "\25bc";
}  */

.content {
   padding: 0 18px;
   display: none;
   overflow: hidden;
   /* background-color: #f1f1f1; */
  
}
.arrow {
	cursor: pointer;
	display: inline-block;
    color: white;
	/* transition: transform 200ms; */
}
.arrowDown { transform: rotate(90deg); }

</style>
