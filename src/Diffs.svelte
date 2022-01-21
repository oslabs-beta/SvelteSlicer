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
                    <li class='diffComponentName'>Component: {diff.component}</li>

                    <br>
                    {#if !diff.oldValue}
                        <li>{diff.name}: N/A</li>
                        {:else}
                        <p>{diff.name}: <span class='oldValue'>{diff.oldValue}</span> <span>--> {diff.newValue}</span></p>


                    {/if}


                </ul>
            {/each}
    </div>
</main>