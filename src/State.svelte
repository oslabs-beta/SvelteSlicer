<script>
	export let I;
    import {snapshots} from './stores.js';
    import Variable from './Variable.svelte';
    import CollapsibleSection from './CollapsibleSection.svelte';

    $: data = $snapshots[I].data;
    $: label = $snapshots[I].label;

    $: componentObject = (Object.keys(data).sort().filter(component => data[component].active)).reduce((result, component) => {
        const { tagName } = data[component];
        result[tagName] = result[tagName] ?? [];
        result[tagName].push(component);
        return result;
    }, {})

function log() {
    console.log(componentObject);
}
</script>

<main>
    <button on:click={log}>Press Me</button>
    {#if data}
    <h2>{label}</h2>
        {#each Object.keys(componentObject) as componentGroup} 
            {#each componentObject[componentGroup] as componentName, i}
                {#if componentObject[componentGroup].length === 1 }
                    {#if Object.keys(data[componentName].variables).length}
                        <CollapsibleSection headerText={data[componentName].tagName}>
                            <div class="content">
                            {#each Object.keys(data[componentName].variables) as variable}  
                                {#if data[componentName].variables[variable].value !==undefined && data[componentName].variables[variable].value !== null}  
                                    <Variable variable={data[componentName].variables[variable]}/>                
                                {/if}
                            {/each}
                            </div>
                        </CollapsibleSection>
                    {/if}    
                {:else}
                    {#if Object.keys(data[componentName].variables).length}
                        <CollapsibleSection headerText={data[componentName].tagName + '[' + i + ']'}>
                            <div class="content">
                            {#each Object.keys(data[componentName].variables) as variable}  
                                {#if data[componentName].variables[variable].value !==undefined && data[componentName].variables[variable].value !== null}  
                                    <Variable variable={data[componentName].variables[variable]}/>                
                                {/if}
                            {/each}
                            </div>
                        </CollapsibleSection>
                    {/if}  
                {/if}  
            {/each}
        {/each}
    {/if}
</main>

<style>
</style>
