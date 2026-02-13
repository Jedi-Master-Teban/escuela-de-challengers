import { getItemsByTag, getSummonersRiftItems, type Item } from './itemService';

/**
 * Role-based item recommendations for when web scraping fails.
 * These are general item suggestions based on champion role/type.
 */

// Item IDs for common role-appropriate items
const ROLE_RECOMMENDATIONS: Record<string, { core: string[]; situational: string[]; boots: string[] }> = {
  // Marksman / ADC
  marksman: {
    core: ['3031', '3085', '6676'], // IE, RFC, Galeforce (example mythic options)
    situational: ['3094', '3072', '3046', '3036', '3139', '6333', '6672'], // Runaan, BT, SS, LDR, Mortal, DD, Terminus
    boots: ['3006', '3047', '3158'] // Berserker, Plated Steelcaps, Mobis
  },
  
  // Assassin (AP)
  assassin_ap: {
    core: ['3285', '4645', '4629'], // Ludens, Rocketbelt, Night Harvester
    situational: ['3157', '3102', '3165', '3100', '3116', '3146'], // Zhonya, Banshee, Morello, Rabadon, LB, Void Staff
    boots: ['3020', '3158'] // Sorcerers, Ionian
  },
  
  // Assassin (AD)
  assassin_ad: {
    core: ['6693', '6692', '6691'], // Prowlers, Eclipse, Profane
    situational: ['3156', '3139', '3814', '3072', '6333', '3036'], // GB, Mortal, DD, LDR, Cleaver
    boots: ['3158', '3047'] // Ionian, Steelcaps
  },
  
  // Mage (Burst)
  mage_burst: {
    core: ['3285', '4645', '3089'], // Ludens, Rocketbelt, Rabadon
    situational: ['3157', '3102', '3165', '3100', '3116', '3146'], // Zhonya, Banshee, Morello, Rabadon, LB, Void Staff
    boots: ['3020', '3158'] // Sorcerers, Ionian
  },
  
  // Mage (Battle)
  mage_battle: {
    core: ['3065', '3742', '3053'], // Frozen Heart, Titanic, Hollow Radiance
    situational: ['3116', '3146', '3102', '3165', '3001'], // LB, Void, Banshee, Morello, Zhonya
    boots: ['3020', '3047'] // Sorcerers, Steelcaps
  },
  
  // Fighter / Juggernaut
  fighter: {
    core: ['3078', '3053', '3742'], // Trinity, Hollow, Titanic
    situational: ['6333', '3139', '3072', '3051', '3143', '3161'], // DD, Mortal, BT, BC, Stride, Jaks
    boots: ['3047', '3111', '3158'] // Steelcaps, Mercs, Ionian
  },
  
  // Tank (Tankiness)
  tank: {
    core: ['3065', '3075', '3742'], // Frozen Heart, Sunfire, Hollow
    situational: ['3143', '3190', '3083', '3193', '3001', '3156'], // Stridebreaker, Locket, Warmog, Gargoyle, Zhonya, GB
    boots: ['3047', '3111'] // Steelcaps, Mercs
  },
  
  // Support (Enchanter)
  support_enchanter: {
    core: ['3107', '3179', '3504'], // Ardent, Redemption, Mikael
    situational: ['3117', '3222', '3190', '3050', '2065'], // Mobis, Shurelya, Locket, Fimbulwinter, Echoes
    boots: ['3117', '3158'] // Mobis, Lucidity
  },
  
  // Support (Tank)
  support_tank: {
    core: ['3190', '3109', '3871'], // Locket, Meka, Tears
    situational: ['3075', '3143', '3050', '3117', '3193'], // Thornmail, Stride, Fimbulwinter, Mobis, Gargoyle
    boots: ['3047', '3111'] // Steelcaps, Mercs
  },
  
  // Jungle (Fighter)
  jungle_fighter: {
    core: ['3078', '3742', '3053'], // Trinity, Titanic, Hollow
    situational: ['6333', '3139', '3072', '3051', '3143'], // DD, Mortal, BT, BC, Stride
    boots: ['3047', '3111'] // Steelcaps, Mercs
  },
  
  // Jungle (Assassin)
  jungle_assassin: {
    core: ['6693', '6692', '6691'], // Prowlers, Eclipse, Profane
    situational: ['3156', '3139', '3814', '3072', '6333'], // GB, Mortal, DD, LDR
    boots: ['3158', '3047'] // Ionian, Steelcaps
  }
};

/**
 * Champion archetype to role recommendation mapping
 */
export function getRoleForChampion(championRole: string): string {
  const roleMap: Record<string, string> = {
    // Marksmen
    'jinx': 'marksman',
    'caitlyn': 'marksman',
    'jhin': 'marksman',
    'kaisa': 'marksman',
    'tristana': 'marksman',
    'vayne': 'marksman',
    'aphelios': 'marksman',
    'sivir': 'marksman',
    'draven': 'marksman',
    'quinn': 'marksman',
    'corki': 'mage_burst',
    'ezreal': 'mage_burst',
    'lucian': 'marksman',
    'samira': 'marksman',
    
    // Assassins AP
    'ahri': 'mage_burst',
    'akali': 'assassin_ad',
    'evelynn': 'assassin_ap',
    'kassadin': 'assassin_ap',
    'leblanc': 'assassin_ap',
    'lissandra': 'mage_burst',
    'zyra': 'mage_burst',
    
    // Assassins AD
    'zed': 'assassin_ad',
    'khazix': 'assassin_ad',
    'rengar': 'assassin_ad',
    'talon': 'assassin_ad',
    'nidalee': 'jungle_assassin',
    'reksai': 'jungle_fighter',
    'vi': 'fighter',
    
    // Mages Burst
    'lux': 'mage_burst',
    'xerath': 'mage_burst',
    'ziggs': 'mage_burst',
    'velkoz': 'mage_burst',
    'syndra': 'mage_burst',
    'orianna': 'mage_battle',
    'viktor': 'mage_burst',
    
    // Fighters
    'yasuo': 'fighter',
    'yone': 'fighter',
    'irelia': 'fighter',
    'riven': 'fighter',
    'fiora': 'fighter',
    'camille': 'fighter',
    'jax': 'fighter',
    'tryndamere': 'fighter',
    'udyr': 'jungle_fighter',
    'xinzhao': 'jungle_fighter',
    'leesin': 'jungle_fighter',
    'hecarim': 'jungle_fighter',
    'graves': 'marksman',
    
    // Tanks
    'ornn': 'tank',
    'malphite': 'tank',
    'sejuani': 'jungle_fighter',
    'zac': 'jungle_fighter',
    'rammus': 'tank',
    'leona': 'support_tank',
    'nautilus': 'tank',
    'thresh': 'support_tank',
    'braum': 'support_tank',
    'alistar': 'support_tank',
    'shen': 'tank',
    'poppy': 'tank',
    'sion': 'tank',
    'mordekaiser': 'fighter',
    
    // Supports
    'soraka': 'support_enchanter',
    'nami': 'support_enchanter',
    'lulu': 'support_enchanter',
    'janna': 'support_enchanter',
    'karma': 'support_enchanter',
    'yuumi': 'support_enchanter',
    'milio': 'support_enchanter',
    
    // Default to fighter if unknown
    'default': 'fighter'
  };
  
  const normalizedRole = championRole.toLowerCase().replace(/['\s]/g, '');
  return roleMap[normalizedRole] || 'default';
}

/**
 * Get role-based item recommendations
 */
export async function getRoleBasedItems(roleKey: string): Promise<{ core: Item[]; situational: Item[]; boots: Item[] }> {
  const recommendations = ROLE_RECOMMENDATIONS[roleKey] || ROLE_RECOMMENDATIONS['default'];
  
  // Get all items from DataDragon
  const allItems = await getSummonersRiftItems();
  const itemsById = Object.fromEntries(allItems.map(item => [item.id, item]));
  
  // Filter to get purchasable items
  const core = recommendations.core
    .map(id => itemsById[id])
    .filter((item): item is Item => item !== undefined && item.gold.purchasable);
  
  const situational = recommendations.situational
    .map(id => itemsById[id])
    .filter((item): item is Item => item !== undefined && item.gold.purchasable);
  
  const boots = recommendations.boots
    .map(id => itemsById[id])
    .filter((item): item is Item => item !== undefined && item.gold.purchasable);
  
  return { core, situational, boots };
}

/**
 * Get role-based rune recommendations
 */
export function getRoleBasedRunes(roleKey: string): { primary: { tree: number; keystone: number; runes: number[] }; secondary: { tree: number; runes: number[] } } {
  const runeRecommendations: Record<string, { primary: { tree: number; keystone: number; runes: number[] }; secondary: { tree: number; runes: number[] } }> = {
    marksman: {
      primary: { tree: 8000, keystone: 8008, runes: [8009, 9103, 8017] }, // Lethal Tempo
      secondary: { tree: 8200, runes: [8234, 8232] } // Domination
    },
    assassin_ad: {
      primary: { tree: 8100, keystone: 8112, runes: [8143, 8138, 8135] }, // Electrocute
      secondary: { tree: 8300, runes: [8347, 8304] } // Resolve
    },
    assassin_ap: {
      primary: { tree: 8200, keystone: 8229, runes: [8226, 8210, 8237] }, // Arcane Comet
      secondary: { tree: 8300, runes: [8347, 8345] } // Resolve
    },
    mage_burst: {
      primary: { tree: 8200, keystone: 8229, runes: [8226, 8210, 8237] }, // Arcane Comet
      secondary: { tree: 8300, runes: [8347, 8304] } // Resolve
    },
    mage_battle: {
      primary: { tree: 8400, keystone: 8439, runes: [8463, 8444, 8242] }, // Aftershock
      secondary: { tree: 8200, runes: [8210, 8237] } // Sorcery
    },
    fighter: {
      primary: { tree: 8000, keystone: 8010, runes: [9111, 9104, 8299] }, // Conqueror
      secondary: { tree: 8400, runes: [8444, 8242] } // Resolve
    },
    tank: {
      primary: { tree: 8400, keystone: 8439, runes: [8463, 8444, 8242] }, // Aftershock
      secondary: { tree: 8300, runes: [8345, 8347] } // Resolve
    },
    support_enchanter: {
      primary: { tree: 8200, keystone: 8230, runes: [8210, 8224, 8237] }, // Summon Aery
      secondary: { tree: 8400, runes: [8444, 8463] } // Resolve
    },
    support_tank: {
      primary: { tree: 8400, keystone: 8439, runes: [8463, 8444, 8242] }, // Aftershock
      secondary: { tree: 8200, runes: [8210, 8237] } // Sorcery
    },
    jungle_fighter: {
      primary: { tree: 8000, keystone: 8010, runes: [9111, 9104, 8299] }, // Conqueror
      secondary: { tree: 8400, runes: [8444, 8242] } // Resolve
    },
    jungle_assassin: {
      primary: { tree: 8100, keystone: 8112, runes: [8143, 8138, 8135] }, // Electrocute
      secondary: { tree: 8300, runes: [8347, 8345] } // Resolve
    },
    default: {
      primary: { tree: 8000, keystone: 8010, runes: [9111, 9104, 8299] }, // Conqueror
      secondary: { tree: 8400, runes: [8444, 8242] } // Resolve
    }
  };
  
  return runeRecommendations[roleKey] || runeRecommendations['default'];
}
