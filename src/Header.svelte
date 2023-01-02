<script>
  import logo from "../extension/devtools/public/images/logo64.png";
</script>

<div id="header">
  <img id="logo" src={logo} alt="logo" />
  <h2 id="titleText">Svelte Slicer 2.2.2</h2>
</div>

<style>
  #header {
    display: flex;
    flex-direction: row;
    height: fit-content;
    align-items: center;
    margin: 5px;
  }
  #logo {
    height: 33px;
    width: 33px;
  }
  #titleText {
    font-size: 15px;
  }
</style>
