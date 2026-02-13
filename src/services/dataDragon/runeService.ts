// Version caching for Data Dragon
let cachedVersion: string | null = null;
let versionCacheTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const FALLBACK_VERSION = '15.3.1';

/**
 * Fetches the latest Data Dragon version from Riot API
 * Caches the version for 24 hours to avoid excessive API calls
 */
async function getLatestVersion(): Promise<string> {
  const now = Date.now();
  
  // Return cached version if still valid
  if (cachedVersion && (now - versionCacheTime) < CACHE_DURATION) {
    return cachedVersion;
  }
  
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const versions: string[] = await response.json();
    
    if (versions && versions.length > 0) {
      cachedVersion = versions[0];
      versionCacheTime = now;
      console.log(`Data Dragon version updated to: ${cachedVersion}`);
      return cachedVersion;
    }
    
    throw new Error('No versions returned');
  } catch (error) {
    console.error('Failed to fetch Data Dragon version:', error);
    return FALLBACK_VERSION; // Fallback to hardcoded version
  }
}

// Dynamic base URL that resolves to the latest version
let ddragonBaseUrl: string | null = null;

/**
 * Gets the Data Dragon base URL with the latest version
 */
export async function getDdragonBaseUrl(): Promise<string> {
  if (ddragonBaseUrl) {
    return ddragonBaseUrl;
  }
  const version = await getLatestVersion();
  ddragonBaseUrl = `https://ddragon.leagueoflegends.com/cdn/${version}`;
  return ddragonBaseUrl;
}

/**
 * Clears the version cache (useful for testing or manual refresh)
 */
export function clearVersionCache(): void {
  cachedVersion = null;
  versionCacheTime = 0;
  ddragonBaseUrl = null;
}

/**
 * Gets the current cached version (or null if not cached)
 */
export function getCachedVersion(): string | null {
  return cachedVersion;
}

export interface Rune {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
}

export interface RuneSlot {
  runes: Rune[];
}

export interface RuneTree {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: RuneSlot[];
}

let runesCache: RuneTree[] | null = null;

/**
 * Gets all rune trees from Data Dragon
 */
export async function getRuneTrees(): Promise<RuneTree[]> {
  if (runesCache) {
    return runesCache;
  }

  const baseUrl = await getDdragonBaseUrl();
  const response = await fetch(`${baseUrl}/data/es_MX/runesReforged.json`);
  const data = await response.json();
  
  runesCache = data;
  return data;
}

/**
 * Gets a specific rune tree by ID
 */
export async function getRuneTreeById(treeId: number): Promise<RuneTree | null> {
  const trees = await getRuneTrees();
  return trees.find(tree => tree.id === treeId) || null;
}

/**
 * Gets a specific rune tree by key
 */
export async function getRuneTreeByKey(key: string): Promise<RuneTree | null> {
  const trees = await getRuneTrees();
  return trees.find(tree => tree.key === key) || null;
}

/**
 * Gets a specific rune by ID
 */
export async function getRuneById(runeId: number): Promise<Rune | null> {
  const trees = await getRuneTrees();
  
  for (const tree of trees) {
    for (const slot of tree.slots) {
      const rune = slot.runes.find(r => r.id === runeId);
      if (rune) return rune;
    }
  }
  
  return null;
}

/**
 * Gets all keystones (first row of each tree)
 */
export async function getKeystones(): Promise<Rune[]> {
  const trees = await getRuneTrees();
  const keystones: Rune[] = [];
  
  for (const tree of trees) {
    if (tree.slots.length > 0) {
      keystones.push(...tree.slots[0].runes);
    }
  }
  
  return keystones;
}

/**
 * Gets the URL for a rune icon
 * Note: Rune icons use a different CDN path that doesn't include the version
 */
export function getRuneIconUrl(iconPath: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`;
}

/**
 * Rune tree colors for UI styling
 */
export const RUNE_TREE_COLORS: Record<string, string> = {
  'Domination': '#e84057',   // Red
  'Inspiration': '#49aab9',   // Teal
  'Precision': '#c8aa6e',     // Gold
  'Resolve': '#a1d586',       // Green
  'Sorcery': '#9faafc'        // Blue/Purple
};

/**
 * Gets the tree that contains a specific rune
 */
export async function getRuneTree(runeId: number): Promise<RuneTree | null> {
  const trees = await getRuneTrees();
  
  for (const tree of trees) {
    for (const slot of tree.slots) {
      if (slot.runes.some(r => r.id === runeId)) {
        return tree;
      }
    }
  }
  
  return null;
}

/**
 * Strips HTML tags from rune descriptions
 */
export function cleanDescription(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')           // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/\s+/g, ' ')              // Replace multiple spaces with single space
    .trim();
}

// ==========================================
// STAT SHARDS SYSTEM
// ==========================================

// Stat shard definition with slot information
export interface StatShard {
  id: number;
  slot: number;  // 0 = Ofensivo, 1 = Flex, 2 = Defensa
  key: string;
  name: string;
  icon: string;
  stats: {
    adaptive?: number;
    attackSpeed?: number;
    ah?: number;  // Ability Haste
    armor?: number;
    mr?: number;   // Magic Resist
    hp?: number;   // Health Scaling
  };
}

// Official LoL Stat Shards System (Spanish Names)
// Each slot has 3 options to choose from
export const STAT_SHARDS: StatShard[] = [
  // Slot 0: Ofensivo (Offense)
  { id: 5008, slot: 0, key: 'AdaptiveForce', name: 'Fuerza Adaptativa', icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png', stats: { adaptive: 9 } },
  { id: 5005, slot: 0, key: 'AttackSpeed', name: 'Velocidad de Ataque', icon: 'perk-images/StatMods/StatModsAttackSpeedIcon.png', stats: { attackSpeed: 5 } },
  { id: 5007, slot: 0, key: 'CDRScaling', name: 'Celeridad', icon: 'perk-images/StatMods/StatModsCDRScalingIcon.png', stats: { ah: 8 } },
  
  // Slot 1: Flex
  { id: 5008, slot: 1, key: 'AdaptiveForce', name: 'Fuerza Adaptativa', icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png', stats: { adaptive: 8 } },
  { id: 5002, slot: 1, key: 'Armor', name: 'Armadura', icon: 'perk-images/StatMods/StatModsArmorIcon.png', stats: { armor: 6 } },
  { id: 5003, slot: 1, key: 'MagicRes', name: 'Resistencia Mágica', icon: 'perk-images/StatMods/StatModsMagicResIcon.png', stats: { mr: 6 } },
  
  // Slot 2: Defensa (Defense)
  { id: 5001, slot: 2, key: 'HealthScaling', name: 'Vida', icon: 'perk-images/StatMods/StatModsHealthScalingIcon.png', stats: { hp: 15 } },
  { id: 5002, slot: 2, key: 'Armor', name: 'Armadura', icon: 'perk-images/StatMods/StatModsArmorIcon.png', stats: { armor: 5 } },
  { id: 5003, slot: 2, key: 'MagicRes', name: 'Resistencia Mágica', icon: 'perk-images/StatMods/StatModsMagicResIcon.png', stats: { mr: 5 } },
];

// Group stat shards by slot for display
export const STAT_SHARDS_BY_SLOT = [
  { slot: 0, name: 'Ofensivo' },
  { slot: 1, name: 'Flex' },
  { slot: 2, name: 'Defensa' },
];

// Get a stat shard by ID and slot
export function getStatShardByIdAndSlot(id: number, slot: number): StatShard | undefined {
  return STAT_SHARDS.find(s => s.id === id && s.slot === slot);
}

// Get stat shards for a specific slot
export function getStatShardsBySlot(slot: number): StatShard[] {
  return STAT_SHARDS.filter(s => s.slot === slot);
}
