<script>
	export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    import CollapsibleSection from './CollapsibleSection.svelte';

    $: data = $snapshots[I].data;
    $: label = $snapshots[I].label;

    $: componentList = (Object.keys(data).sort())

</script>

<main>
    {#if data}
    <h2>Snapshot {I}: {label}</h2>
        {#each componentList as componentName} 
            {#if Object.keys(data[componentName].variables).length}
                <CollapsibleSection headerText={data[componentName].id}>
                    <div class="content">
                        {#each Object.keys(data[componentName].variables) as variable}  
                            {#if data[componentName].variables[variable].value !==undefined && data[componentName].variables[variable].value !== null}  
                                <Variable variable={data[componentName].variables[variable]}/>                
                            {/if}
                        {/each}
                    </div>
                </CollapsibleSection>
            {/if}     
        {/each}
    {/if}
</main>

<style>
</style>
