<script>
    export let I;
    import {snapshots} from './stores.js';
    $: snapshot = $snapshots[I];

  
        function clickhandler() {

        console.log('snapshots no s ', snapshot);
        console.log('snapshots$', $snapshots)
        console.log('snapshot.diff ', snapshot.diff)
    
 }
  
</script>

<main>
    <div id="valuesList">
        <h2>Data</h2>
        <button on:click={clickhandler}>Log State/Diffs</button>
            {#each snapshot.diff as diff ,i}
                <ul id="myOl">
                    <li>Component: {diff.component}</li>
                    <br>
                    <li>Variable Name: {diff.name}</li>
                    <br>
                    {#if !diff.oldValue}
                        <li>N/A</li>
                        {:else}
                        <li>Old Value: {diff.oldValue}</li>
                    {/if}
                    <br>
                    <li>New Value: {diff.newValue}</li>
                    <br>
                </ul>
            {/each}
    </div>
</main>
