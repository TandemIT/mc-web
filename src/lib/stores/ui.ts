import { writable } from 'svelte/store';

export const theme = writable<'light' | 'dark'>('light');
export const viewMode = writable<'grid' | 'list'>('grid');
