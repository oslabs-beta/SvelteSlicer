<script>
  function filterEventHandler() {}

  function resetFilter() {}
</script>

<div id="filter-1">
  <form on:submit|preventDefault={(e) => filterEventHandler(e)} class="form">
    <input
      type="text"
      placeholder="Filter..."
      name="search"
      class="search-field-1"
    />
  </form>
  <button type="submit" class="search-button-1">
    <i class="fa fa-search" />
  </button>

  <button on:click={resetFilter}>Reset</button>
</div>

<style>
  #filter-1 {
    width: 20em;
    border-style: none dashed none none;
    border-color: red;

    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.2em;
  }

  .search-button-1 {
    color: rgb(162, 159, 159);
    background: transparent;
    outline: none;
    padding: 5px 0px 0px 0px;
    font-size: 1.35rem;
  }
  .search-field-1 {
    width: 12em;
  }
</style>
