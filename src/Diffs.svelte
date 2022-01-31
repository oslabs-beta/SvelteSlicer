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
                <h3 class="diffsHeading">New Components</h3>
                {#each newComponents as component}
                    <h4 class='diffComponentName'>{component.component}</h4>
                {/each}
            {/if}
            {#if deletedComponents.length} 
                <h3 class='diffsHeading'>Deleted Components</h3>
                {#each deletedComponents as component}
                    <h4 class='deletedComponent'>{component.component}</h4>
                {/each}
            {/if}
            {#if changedVariables.length} 
                <h3 class='diffsHeading'>Changed Variables</h3>
                {#each changedVariables as component}
                    <h4 class='diffComponentName'>{component[0].component}</h4>
                    <ul>
                    {#each component as variable} 
                        {#if variable.oldValue !== '' && variable.newValue !== ''}
                            <li class="oldAndNewVals">{variable.name}: <span class='oldValue'>{variable.oldValue}</span> <span> --> {variable.newValue}</span></li>
                        {:else if variable.oldValue === ''}
                            <li class="oldAndNewVals">{variable.name}: <span class='oldValue'>' '</span> <span> --> {variable.newValue}</span></li>
                        {:else if variable.newValue === ''}
                            <li class="oldAndNewVals">{variable.name}: <span class='oldValue'>{variable.oldValue}</span> <span> --> ' '</span></li>
                        {/if}
                    {/each}
                    </ul>
                {/each}
            {/if}
    </div>
</main>

<style>
    .diffsHeading {
        text-decoration: underline;
    }
</style>
