<script>
    export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    $: snapshot = $snapshots[I];
    $: newComponents = snapshot.diff.newComponents;
    $: deletedComponents = snapshot.diff.deletedComponents;
    $: changedVariables = snapshot.diff.changedVariables;

    console.log(changedVariables);

</script>

<main>
    <div id="valuesList">
        <h2>Snapshot {I}: {snapshot.label}</h2>
            {#if newComponents.length} 
                <h3>New Components</h3>
                {#each newComponents as component}
                    <h4>{component.component}</h4>
                    {#each Object.keys(component.variables) as variable}
                        {#if component.variables[variable].value !== undefined}
                            <Variable variable={component.variables[variable]}/>
                        {/if}
                    {/each}
                {/each}
            {/if}
            {#if deletedComponents.length} 
                <h3>Deleted Components</h3>
                {#each deletedComponents as component}
                    <h4>{component.component}</h4>
                    {#each Object.keys(component.variables) as variable}
                        {#if component.variables[variable].value !== undefined}
                            <Variable variable={component.variables[variable]}/>
                        {/if}
                    {/each}
                {/each}
            {/if}
            {#if changedVariables.length} 
                <h3>Changed Variables</h3>
                {#each changedVariables as component}
                    <h4>{component[0].component}</h4>
                    {#each component as variable} 
                        <p>{variable.name}: {variable.oldValue} => {variable.newValue}</p>
                    {/each}
                {/each}
            {/if}
    </div>
</main>
