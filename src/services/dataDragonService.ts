// DataDragon Service - Fetches champion data from Riot's CDN
import type { 
  ChampionListData, 
  ChampionDetailData, 
  ChampionSummary,
  ChampionDetail,
  ChampionRole
} from '../types/dataDragon';

// DataDragon CDN base URL
const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';
const DDRAGON_CDN = `${DDRAGON_BASE}/cdn`;

// Cache for version and champion data
let cachedVersion: string | null = null;
let cachedChampions: ChampionSummary[] | null = null;

/**
 * Get the latest DataDragon version
 */
export async function getLatestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  
  const response = await fetch(`${DDRAGON_BASE}/api/versions.json`);
  const versions: string[] = await response.json();
  cachedVersion = versions[0];
  return cachedVersion;
}

/**
 * Get all champions (summary data)
 */
export async function getChampions(): Promise<ChampionSummary[]> {
  if (cachedChampions) return cachedChampions;
  
  const version = await getLatestVersion();
  const response = await fetch(
    `${DDRAGON_CDN}/${version}/data/es_MX/champion.json`
  );
  const data: ChampionListData = await response.json();
  
  cachedChampions = Object.values(data.data).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return cachedChampions;
}

/**
 * Get detailed champion data (includes abilities)
 */
export async function getChampionDetail(championId: string): Promise<ChampionDetail | null> {
  try {
    const version = await getLatestVersion();
    const response = await fetch(
      `${DDRAGON_CDN}/${version}/data/es_MX/champion/${championId}.json`
    );
    
    if (!response.ok) return null;
    
    const data: ChampionDetailData = await response.json();
    return data.data[championId];
  } catch {
    console.error(`Failed to fetch champion: ${championId}`);
    return null;
  }
}

/**
 * Filter champions by role
 */
export async function getChampionsByRole(role: ChampionRole): Promise<ChampionSummary[]> {
  const champions = await getChampions();
  return champions.filter(champ => champ.tags.includes(role));
}

/**
 * Search champions by name
 */
export async function searchChampions(query: string): Promise<ChampionSummary[]> {
  const champions = await getChampions();
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return champions.filter(champ => {
    const normalizedName = champ.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedName.includes(normalizedQuery);
  });
}

// Asset URL builders
export function getChampionSquareUrl(championId: string, version?: string): string {
  const v = version || cachedVersion || '16.3.1';
  return `${DDRAGON_CDN}/${v}/img/champion/${championId}.png`;
}

export function getChampionSplashUrl(championId: string, skinNum = 0): string {
  return `${DDRAGON_CDN}/img/champion/splash/${championId}_${skinNum}.jpg`;
}

export function getChampionLoadingUrl(championId: string, skinNum = 0): string {
  return `${DDRAGON_CDN}/img/champion/loading/${championId}_${skinNum}.jpg`;
}

export function getSpellIconUrl(spellImage: string, version?: string): string {
  const v = version || cachedVersion || '16.3.1';
  return `${DDRAGON_CDN}/${v}/img/spell/${spellImage}`;
}

export function getPassiveIconUrl(passiveImage: string, version?: string): string {
  const v = version || cachedVersion || '16.3.1';
  return `${DDRAGON_CDN}/${v}/img/passive/${passiveImage}`;
}

/**
 * Calculate stat at a given level
 */
export function calculateStatAtLevel(
  baseStat: number,
  growthStat: number,
  level: number
): number {
  // Riot's official formula for stat scaling
  return baseStat + growthStat * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

/**
 * Format stat value for display
 */
export function formatStat(value: number, decimals = 0): string {
  return value.toFixed(decimals);
}
