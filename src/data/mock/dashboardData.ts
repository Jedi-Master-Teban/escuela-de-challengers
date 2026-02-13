// Mock types
export interface RankData {
  tier: 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER';
  rank: 'I' | 'II' | 'III' | 'IV';
  lp: number;
  wins: number;
  losses: number;
  winrate: number;
}

export interface MatchData {
  id: string;
  championName: string;
  championId: string;
  role: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  win: boolean;
  kda: { k: number; d: number; a: number };
  cs: number;
  csPerMin: number;
  visionScore: number;
  gameDuration: number; // in seconds
  timestamp: number;
  items: number[];
}

export interface LPDataPoint {
  date: string;
  lp: number;
}

// Mock Data (Real Case Placeholder: High Elo Player)
export const MOCK_RANK_DATA: RankData = {
  tier: 'CHALLENGER',
  rank: 'I',
  lp: 1245,
  wins: 142,
  losses: 98,
  winrate: 59,
};

export const MOCK_MATCH_HISTORY: MatchData[] = [
  {
    id: '1',
    championName: 'Azir',
    championId: 'Azir',
    role: 'MID',
    win: true,
    kda: { k: 8, d: 2, a: 12 },
    cs: 245,
    csPerMin: 9.2,
    visionScore: 42,
    gameDuration: 1945, // 32:25
    timestamp: Date.now() - 3600000 * 2,
    items: [6655, 3089, 3020, 1056, 1001, 3363],
  },
  {
    id: '2',
    championName: 'Orianna',
    championId: 'Orianna',
    role: 'MID',
    win: false,
    kda: { k: 3, d: 5, a: 9 },
    cs: 210,
    csPerMin: 8.8,
    visionScore: 35,
    gameDuration: 1620, // 27:00
    timestamp: Date.now() - 3600000 * 25,
    items: [6653, 3040, 3020],
  },
  {
    id: '3',
    championName: 'LeBlanc',
    championId: 'Leblanc',
    role: 'MID',
    win: true,
    kda: { k: 12, d: 1, a: 5 },
    cs: 195,
    csPerMin: 7.9,
    visionScore: 28,
    gameDuration: 1500, // 25:00
    timestamp: Date.now() - 3600000 * 48,
    items: [6655, 3089, 3157, 3020, 4645],
  },
  {
    id: '4',
    championName: 'Jayce',
    championId: 'Jayce',
    role: 'MID',
    win: true,
    kda: { k: 9, d: 3, a: 8 },
    cs: 280,
    csPerMin: 9.5,
    visionScore: 38,
    gameDuration: 2100, // 35:00
    timestamp: Date.now() - 3600000 * 72,
    items: [6692, 3142, 3020],
  },
  {
    id: '5',
    championName: 'Sylas',
    championId: 'Sylas',
    role: 'MID',
    win: false,
    kda: { k: 6, d: 7, a: 4 },
    cs: 180,
    csPerMin: 7.2,
    visionScore: 25,
    gameDuration: 1680, // 28:00
    timestamp: Date.now() - 3600000 * 96,
    items: [6656, 3157, 3020],
  },
];

export const MOCK_LP_HISTORY: LPDataPoint[] = [
  { date: 'Feb 1', lp: 0 },
  { date: 'Feb 2', lp: 15 },
  { date: 'Feb 3', lp: 10 },
  { date: 'Feb 4', lp: 28 },
  { date: 'Feb 5', lp: 45 },
  { date: 'Feb 6', lp: 32 },
  { date: 'Feb 7', lp: 52 },
  { date: 'Feb 8', lp: 48 },
];

export const MOCK_STATS_SUMMARY = {
  kda: '4.8',
  winrate: '59%',
  csPerMin: '8.9',
  visionPerMin: '1.2',
  damagePerMin: '850',
};

// Course Data (for Hero Cards)
export const MOCK_COURSES = [
  {
    id: 'fundamentals',
    title: 'FUNDAMENTOS DE CHALLENGER',
    subtitle: 'Domina las bases esenciales',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg', // Placeholder
    lessonsCount: 12,
    completed: 4,
    rating: 4.9,
    views: '12.5k',
    tags: ['Básico', 'Lane Phase'],
    recommended: true,
  },
  {
    id: 'macro',
    title: 'MACRO GAME MASTERCLASS',
    subtitle: 'Controla el mapa como un pro',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/TwistedFate_0.jpg', // Placeholder
    lessonsCount: 8,
    completed: 0,
    rating: 4.8,
    views: '8.2k',
    tags: ['Avanzado', 'Rotaciones'],
    recommended: false,
  },
  {
    id: 'mechanics',
    title: 'MECÁNICAS AVANZADAS',
    subtitle: 'Outplays instantáneos',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Irelia_0.jpg', // Placeholder
    lessonsCount: 15,
    completed: 0,
    rating: 5.0,
    views: '22k',
    tags: ['Hard', 'Combos'],
    recommended: false,
  },
  {
    id: 'mental',
    title: 'MENTALIDAD DE ACERO',
    subtitle: 'Nunca te tiltees',
    image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Karma_0.jpg', // Placeholder
    lessonsCount: 6,
    completed: 0,
    rating: 4.7,
    views: '5.1k',
    tags: ['Psicología', 'Tilt'],
    recommended: false,
  },
];
