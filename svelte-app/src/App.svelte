<script>
import {components} from './stores.js';

console.log($components);
	
</script>

<main>
	<p>Hello World</p>
	<ul>
	{#each $components as component} 
		<li>{component.tagName}</li>
	{/each}
	</ul>
	

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
