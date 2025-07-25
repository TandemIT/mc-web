<script lang="ts">
	// Skip navigation component for accessibility
</script>

<div class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
	<a 
		href="#main-content" 
		class="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
	>
		Skip to main content
	</a>
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	
	.focus\:not-sr-only:focus {
		position: static;
		width: auto;
		height: auto;
		padding: inherit;
		margin: inherit;
		overflow: visible;
		clip: auto;
		white-space: normal;
	}
</style>