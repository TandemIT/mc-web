<script lang="ts">
  import { theme } from '../stores/ui';
  let currentTheme: 'light' | 'dark' = 'light';
  $: theme.subscribe((value: 'light' | 'dark') => currentTheme = value);
  function toggleTheme() {
    theme.set(currentTheme === 'light' ? 'dark' : 'light');
  }
</script>
<nav class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
  <div class="font-bold text-lg">Minecraft World Archiver</div>
  <button on:click={toggleTheme} aria-label="Toggle theme" class="px-2 py-1 rounded bg-gray-300 dark:bg-gray-700">
    {currentTheme === 'light' ? '🌞' : '🌙'}
  </button>
</nav>
