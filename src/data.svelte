<script>
    
    export let dataForSelected;
    
    console.log('dataForSelected',dataForSelected)

    let count = 0
    
</script>
<main>
   {#if count++>5}
    <svelte:self dataForSelected={dataForSelected}/>
    {/if}
    
</main>
