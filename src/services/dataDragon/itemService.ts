const DDRAGON_VERSION = '15.3.1';
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

export interface Item {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  gold: {
    base: number;
    total: number;
    sell: number;
    purchasable: boolean;
  };
  stats: Record<string, number>;
  tags: string[];
  from?: string[];
  into?: string[];
  image: {
    full: string;
  };
  maps: Record<string, boolean>;
}

export interface ItemData {
  [key: string]: Item;
}

let itemsCache: ItemData | null = null;

/**
 * Gets all items from Data Dragon
 */
export async function getAllItems(): Promise<ItemData> {
  if (itemsCache) {
    return itemsCache;
  }

  const response = await fetch(`${DDRAGON_BASE}/data/es_MX/item.json`);
  const data = await response.json();
  
  // Add IDs to each item
  const itemsWithIds: ItemData = {};
  for (const [id, item] of Object.entries(data.data)) {
    itemsWithIds[id] = { ...(item as Item), id };
  }
  
  itemsCache = itemsWithIds;
  return itemsWithIds;
}

/**
 * Gets a specific item by ID
 */
export async function getItemById(itemId: string): Promise<Item | null> {
  const items = await getAllItems();
  return items[itemId] || null;
}

/**
 * Gets items by tag (category)
 */
export async function getItemsByTag(tag: string): Promise<Item[]> {
  const items = await getAllItems();
  return Object.values(items).filter(item => item.tags?.includes(tag));
}

/**
 * Gets items available in Summoner's Rift (map 11)
 */
export async function getSummonersRiftItems(): Promise<Item[]> {
  const items = await getAllItems();
  return Object.values(items).filter(item => 
    item.maps?.['11'] === true && 
    item.gold?.purchasable === true
  );
}

/**
 * Gets the URL for an item image
 */
export function getItemImageUrl(imageName: string): string {
  return `${DDRAGON_BASE}/img/item/${imageName}`;
}

/**
 * Gets the recipe (components) for an item
 */
export async function getItemRecipe(itemId: string): Promise<Item[]> {
  const item = await getItemById(itemId);
  if (!item?.from) return [];
  
  const items = await getAllItems();
  return item.from
    .map(id => items[id])
    .filter((item): item is Item => item !== undefined);
}

/**
 * Gets items that build from a specific item
 */
export async function getItemBuildsInto(itemId: string): Promise<Item[]> {
  const item = await getItemById(itemId);
  if (!item?.into) return [];
  
  const items = await getAllItems();
  return item.into
    .map(id => items[id])
    .filter((item): item is Item => item !== undefined);
}

/**
 * In-game shop categories (matching the actual game shop)
 * Organized by primary stat/purpose
 */
export const SHOP_CATEGORIES = {
  // By item type
  'Iniciales': { 
    icon: '🏁', 
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    filter: (item: Item) => item.tags?.some(t => ['Lane', 'Jungle'].includes(t))
  },
  'Botas': { 
    icon: '👟', 
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    filter: (item: Item) => item.tags?.includes('Boots')
  },
  'Consumibles': { 
    icon: '🧪', 
    color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    filter: (item: Item) => item.tags?.includes('Consumable')
  },
  
  // By primary stat (like in-game shop)
  'Daño de Ataque': { 
    icon: '⚔️', 
    color: 'text-red-400 border-red-500/30 bg-red-500/10',
    filter: (item: Item) => item.tags?.includes('Damage') && !item.tags?.includes('Boots')
  },
  'Velocidad de Ataque': { 
    icon: '🏹', 
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    filter: (item: Item) => item.tags?.includes('AttackSpeed') && !item.tags?.includes('Damage')
  },
  'Crítico': { 
    icon: '💥', 
    color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    filter: (item: Item) => item.tags?.includes('CriticalStrike')
  },
  'Poder de Habilidad': { 
    icon: '🔮', 
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    filter: (item: Item) => item.tags?.includes('SpellDamage')
  },
  'Maná y Regeneración': { 
    icon: '💧', 
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    filter: (item: Item) => (item.tags?.includes('Mana') || item.tags?.includes('ManaRegen')) && !item.tags?.includes('SpellDamage')
  },
  'Vida': { 
    icon: '❤️', 
    color: 'text-green-400 border-green-500/30 bg-green-500/10',
    filter: (item: Item) => item.tags?.includes('Health') && !item.tags?.includes('Armor') && !item.tags?.includes('SpellBlock')
  },
  'Armadura': { 
    icon: '🛡️', 
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    filter: (item: Item) => item.tags?.includes('Armor')
  },
  'Resistencia Mágica': { 
    icon: '🔰', 
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    filter: (item: Item) => item.tags?.includes('SpellBlock') || item.tags?.includes('MagicResist')
  },
  'Robo de Vida': { 
    icon: '🩸', 
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    filter: (item: Item) => item.tags?.includes('LifeSteal') || item.tags?.includes('SpellVamp')
  },
  'Penetración': { 
    icon: '🗡️', 
    color: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    filter: (item: Item) => item.tags?.includes('ArmorPenetration') || item.tags?.includes('MagicPenetration')
  },
  'Reducción de Enfriamiento': { 
    icon: '⏱️', 
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    filter: (item: Item) => item.tags?.includes('AbilityHaste') || item.tags?.includes('CooldownReduction')
  },
  'Movimiento': { 
    icon: '💨', 
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    filter: (item: Item) => item.tags?.includes('NonbootsMovement')
  },
  'Trinkets': { 
    icon: '👁️', 
    color: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
    filter: (item: Item) => item.tags?.includes('Trinket')
  },
};

export type ShopCategory = keyof typeof SHOP_CATEGORIES;

/**
 * Categorizes items matching the in-game shop categories
 */
export function categorizeItemsByShop(items: Item[]): Record<ShopCategory, Item[]> {
  const result: Record<string, Item[]> = {};
  
  // Initialize all categories
  for (const category of Object.keys(SHOP_CATEGORIES)) {
    result[category] = [];
  }
  
  // Categorize each item (can appear in multiple categories like in-game)
  for (const item of items) {
    for (const [category, config] of Object.entries(SHOP_CATEGORIES)) {
      if (config.filter(item)) {
        result[category].push(item);
      }
    }
  }
  
  return result as Record<ShopCategory, Item[]>;
}

/**
 * Gets item tier (Basic, Epic, Legendary, Mythic)
 */
export function getItemTier(item: Item): 'Básico' | 'Épico' | 'Legendario' {
  const totalGold = item.gold?.total || 0;
  const hasComponents = item.from && item.from.length > 0;
  const buildsInto = item.into && item.into.length > 0;
  
  if (!hasComponents && buildsInto) {
    return 'Básico';
  }
  if (hasComponents && buildsInto) {
    return 'Épico';
  }
  if (hasComponents && !buildsInto && totalGold >= 2500) {
    return 'Legendario';
  }
  return 'Básico';
}

/**
 * Legacy categorization - keeping for backwards compatibility
 */
export function categorizeItems(items: Item[]): Record<string, Item[]> {
  return categorizeItemsByShop(items);
}

/**
 * Item stat labels
 */
export const STAT_LABELS: Record<string, string> = {
  'FlatHPPoolMod': 'Vida',
  'FlatMPPoolMod': 'Maná',
  'FlatArmorMod': 'Armadura',
  'FlatSpellBlockMod': 'Resistencia Mágica',
  'FlatPhysicalDamageMod': 'Daño de Ataque',
  'FlatMagicDamageMod': 'Poder de Habilidad',
  'FlatMovementSpeedMod': 'Velocidad de Movimiento',
  'PercentAttackSpeedMod': 'Velocidad de Ataque',
  'FlatCritChanceMod': 'Probabilidad de Crítico',
  'PercentLifeStealMod': 'Robo de Vida',
  'PercentMovementSpeedMod': 'Velocidad de Movimiento %'
};
