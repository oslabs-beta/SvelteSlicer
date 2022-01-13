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

let collapse = document.getElementsByClassName("collapsible");
let i;

function collapsible(){
 
 for (i = 0; i < collapse.length; i++) {
     this.classList.add('arrow')
     this.classList.toggle("active");
     let content = this.nextElementSibling.nextElementSibling;
     if (content.style.display === "block") {
     
      content.style.display = "none";
     } else {
     
     content.style.display = "block";
     }
  
 }
}
    
   
</script>

<main>
    <button on:click={clickhandler}>Log State</button>
    
{#if snapshot && component}
<h2>{snapshot.label}</h2>
    {#each Object.keys(snapshot.data) as componentName} 
        {#if Object.keys(snapshot.data[componentName].variables).length>0 && snapshot.data[componentName].active}
           
        
           <!-- <h3>{snapshot.data[componentName].tagName}</h3> -->
           
           <button class="collapsible" on:click={collapsible}>--{componentName}</button>
           <br/>
           <div class="content">
              
                {#each Object.keys(snapshot.data[componentName].variables) as variable}  
                   {#if snapshot.data[componentName].variables[variable].value}  
                
                      <Variable variable={snapshot.data[componentName].variables[variable]}/>
                
                   {/if}
                {/each}
             
          </div>
            
            
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

/* .active, .collapsible:hover {
  background-color: #555;
} */

/* .collapsible:after {
  content: '\002B';
  color: white;
  font-weight: bold;
  float: right;
  margin-left: 5px;
} */

/* .active:after {
  content: "\2212";
} */

.content {
   padding: 0 18px;
   display: none;
   overflow: hidden;
   /* background-color: #f1f1f1; */
  
}
.arrow {
	cursor: pointer;
	display: inline-block;
	/* transition: transform 200ms; */
}
.arrowDown { transform: rotate(90deg); }

</style>