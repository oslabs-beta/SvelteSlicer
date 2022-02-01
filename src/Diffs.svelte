<script>
    export let I;
    import {snapshots} from './stores.js';
    $: snapshot = $snapshots[I];
    $: newComponents = snapshot.diff.newComponents;
    $: deletedComponents = snapshot.diff.deletedComponents;
    $: changedVariables = snapshot.diff.changedVariables;

</script>

<main>
    <div id="valuesList">
        <h2> Snapshot {I}: {snapshot.label}</h2>
            {#if newComponents.length} 
                <h3 class="diffsHeading">New Components:</h3>
                {#each newComponents as component}
                    <h4 class='diffComponentName'>{component.component}</h4>
                {/each}
            {/if}
            {#if deletedComponents.length} 
                <h3 class='diffsHeading'>Deleted Components:</h3>
                {#each deletedComponents as component}
                    <h4 class='deletedComponent'>{component.component}</h4>
                {/each}
            {/if}
            {#if Object.keys(changedVariables).length} 
                <h3 class='diffsHeading'>Changed Variables:</h3>
                {#each Object.entries(changedVariables) as [componentName, component]}
                    <h4 class='diffComponentName'>{component.id}</h4>
                    <ul>
                    {#each Object.entries(component) as [variableName, variable]} 
                        {#if variable.oldValue !== '' && variable.newValue !== ''}
                            <li class="oldAndNewVals">{variableName}: <span class='oldValue'>{variable.oldValue}</span> <span class='newValue'> &#8594; {variable.newValue}</span></li>
                        {:else if variable.oldValue === ''}
                            <li class="oldAndNewVals">{variableName}: <span class='oldValue'>' '</span> <span class ='newValue'> &#8594; {variable.newValue}</span></li>
                        {:else if variable.newValue === ''}
                            <li class="oldAndNewVals">{variableName}: <span class='oldValue'>{variable.oldValue}</span> <span class='newValue'> &#8594; ' '</span></li>
                        {/if}
                    {/each}
                    </ul>
                {/each}
            {/if}
    </div>
</main>

<style>
    h2 {
        font-size: 19px;
        padding: 0px;
        font-weight: 700;
    }

    h4 {
     padding: 8px;
    }

    h3 {
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .diffsHeading {
        text-decoration: none;
        font-size: 17px;
        font-weight: bolder;
        background-color: rgba(238, 137, 5, 0.288);
    }

    .oldAndNewVals {
	    font-size: 16px;
    }

    .oldValue{
	    text-decoration: line-through;
	    color:rgb(238, 137, 5);
	    font-size: 16px;
        white-space: pre;
    }

    .newValue{
        white-space: pre;
    }

    .diffComponentName{
	    color:white;
	    font-weight: bold;
	    font-size: 16px;
    }

    .deletedComponent{
	    text-decoration: line-through;
	    color:rgb(238, 137, 5);
	    font-size: 16px;
    }

    #valuesList {
	    font-size: 16px;
        padding: 10px;
    }
</style>
