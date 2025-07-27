// FlexSearch integration stub
import FlexSearch from 'flexsearch';
import type { World } from '../types/world';


export const worldIndex = new FlexSearch.Document({
  tokenize: 'forward',
  cache: true,
  document: {
    id: 'filename',
    index: ['displayName', 'category', 'group', 'version', 'tags']
  }
});

export function addWorldsToIndex(worlds: World[]) {
  worlds.forEach(world => {
    worldIndex.add({
      filename: world.filename,
      displayName: world.displayName,
      category: world.category,
      group: world.group,
      version: world.version ?? '',
      tags: world.tags.join(' ')
    });
  });
}

export function searchWorlds(query: string) {
  return worldIndex.search(query);
}
