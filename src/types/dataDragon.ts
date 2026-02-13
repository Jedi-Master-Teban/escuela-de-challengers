// DataDragon Types - Champion data structures from Riot's CDN

export interface ChampionListData {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionSummary>;
}

export interface ChampionSummary {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImage;
  tags: string[];
  partype: string;
  stats: ChampionStats;
}

export interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface ChampionDetailData {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionDetail>;
}

export interface ChampionDetail extends ChampionSummary {
  lore: string;
  allytips: string[];
  enemytips: string[];
  spells: ChampionSpell[];
  passive: ChampionPassive;
  skins: ChampionSkin[];
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip?: {
    label: string[];
    effect: string[];
  };
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  costType: string;
  maxammo: string;
  range: number[];
  rangeBurn: string;
  image: ChampionImage;
  resource?: string;
}

export interface ChampionPassive {
  name: string;
  description: string;
  image: ChampionImage;
}

export interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

// Role mapping for Spanish translations
export const ROLE_TRANSLATIONS: Record<string, string> = {
  Fighter: 'Luchador',
  Tank: 'Tanque',
  Mage: 'Mago',
  Assassin: 'Asesino',
  Marksman: 'Tirador',
  Support: 'Soporte',
};

export const ALL_ROLES = ['Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'] as const;
export type ChampionRole = typeof ALL_ROLES[number];
