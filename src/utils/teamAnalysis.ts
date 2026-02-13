
interface ChampionAttributes {
    id: string;
    damageType: 'AD' | 'AP' | 'Mixed' | 'True' | 'Tank';
    role: ('Tank' | 'Fighter' | 'Mage' | 'Assassin' | 'Marksman' | 'Support')[]; 
    capabilities: {
        hardCC: number; // 0-3
        disengage: number; // 0-3
        poke: number; // 0-3
        waveclear: number; // 0-3
        sustain: number; // 0-3
    };
}

// Temporary Mock Data - In a real app, this should be in a JSON or fetched
export const CHAMPION_DATA: Record<string, ChampionAttributes> = {
    'ahri': { id: 'Ahri', damageType: 'AP', role: ['Mage', 'Assassin'], capabilities: { hardCC: 1, disengage: 1, poke: 2, waveclear: 2, sustain: 1 } },
    'lux': { id: 'Lux', damageType: 'AP', role: ['Mage', 'Support'], capabilities: { hardCC: 1, disengage: 1, poke: 3, waveclear: 2, sustain: 1 } },
    'zed': { id: 'Zed', damageType: 'AD', role: ['Assassin'], capabilities: { hardCC: 0, disengage: 2, poke: 1, waveclear: 1, sustain: 0 } },
    'malphite': { id: 'Malphite', damageType: 'Tank', role: ['Tank'], capabilities: { hardCC: 3, disengage: 0, poke: 1, waveclear: 1, sustain: 0 } },
    'jinx': { id: 'Jinx', damageType: 'AD', role: ['Marksman'], capabilities: { hardCC: 1, disengage: 0, poke: 2, waveclear: 3, sustain: 0 } },
    'thresh': { id: 'Thresh', damageType: 'Tank', role: ['Support', 'Tank'], capabilities: { hardCC: 3, disengage: 2, poke: 0, waveclear: 0, sustain: 0 } },
    'yasuo': { id: 'Yasuo', damageType: 'AD', role: ['Fighter', 'Assassin'], capabilities: { hardCC: 1, disengage: 0, poke: 1, waveclear: 2, sustain: 0 } },
    'yone': { id: 'Yone', damageType: 'Mixed', role: ['Fighter', 'Assassin'], capabilities: { hardCC: 2, disengage: 1, poke: 1, waveclear: 2, sustain: 1 } },
    'garen': { id: 'Garen', damageType: 'AD', role: ['Fighter', 'Tank'], capabilities: { hardCC: 1, disengage: 0, poke: 0, waveclear: 1, sustain: 2 } },
    'leona': { id: 'Leona', damageType: 'Tank', role: ['Tank'], capabilities: { hardCC: 3, disengage: 0, poke: 0, waveclear: 0, sustain: 1 } },
    'lee sin': { id: 'Lee Sin', damageType: 'AD', role: ['Fighter', 'Assassin'], capabilities: { hardCC: 1, disengage: 2, poke: 0, waveclear: 1, sustain: 1 } },
    'katarina': { id: 'Katarina', damageType: 'Mixed', role: ['Assassin'], capabilities: { hardCC: 0, disengage: 1, poke: 0, waveclear: 2, sustain: 0 } },
    'nautilus': { id: 'Nautilus', damageType: 'Tank', role: ['Tank', 'Support'], capabilities: { hardCC: 3, disengage: 1, poke: 0, waveclear: 1, sustain: 1 } },
    'malzahar': { id: 'Malzahar', damageType: 'AP', role: ['Mage'], capabilities: { hardCC: 2, disengage: 0, poke: 1, waveclear: 3, sustain: 0 } },
    'graves': { id: 'Graves', damageType: 'AD', role: ['Marksman', 'Fighter'], capabilities: { hardCC: 0, disengage: 1, poke: 0, waveclear: 2, sustain: 1 } },
    'caitlyn': { id: 'Caitlyn', damageType: 'AD', role: ['Marksman'], capabilities: { hardCC: 1, disengage: 1, poke: 3, waveclear: 2, sustain: 0 } },
    'morgana': { id: 'Morgana', damageType: 'AP', role: ['Mage', 'Support'], capabilities: { hardCC: 2, disengage: 2, poke: 1, waveclear: 2, sustain: 1 } },
    'sett': { id: 'Sett', damageType: 'AD', role: ['Fighter', 'Tank'], capabilities: { hardCC: 2, disengage: 0, poke: 0, waveclear: 1, sustain: 2 } },
};

export interface TeamAnalysisResult {
    damageProfile: { AD: number; AP: number; True: number; Tank: number };
    score: {
        cc: number;
        engage: number;
        waveclear: number;
        durability: number;
    };
    suggestions: string[];
    warnings: string[];
}

export function calculateTeamBalance(championNames: string[]): TeamAnalysisResult {
    const teamStats = {
        damageProfile: { AD: 0, AP: 0, True: 0, Tank: 0 },
        score: { cc: 0, engage: 0, waveclear: 0, durability: 0 }
    };

    const suggestions: string[] = [];
    const warnings: string[] = [];

    let championsFound = 0;

    championNames.forEach(name => {
        const normalizedName = name.toLowerCase().trim();
        const champ = CHAMPION_DATA[normalizedName];
        
        if (champ) {
            championsFound++;
            // Damage Profile
            if (champ.damageType === 'Mixed') {
                teamStats.damageProfile.AD += 0.5;
                teamStats.damageProfile.AP += 0.5;
            } else if (champ.damageType !== 'Tank') {
                teamStats.damageProfile[champ.damageType]++;
            }

            // Scores
            teamStats.score.cc += champ.capabilities.hardCC;
            teamStats.score.waveclear += champ.capabilities.waveclear;
            
            // Durability and Engage heuristic
            if (champ.role.includes('Tank')) {
                teamStats.score.durability += 3;
                teamStats.score.engage += champ.capabilities.hardCC;
            } else if (champ.role.includes('Fighter')) {
                teamStats.score.durability += 1.5;
                teamStats.score.engage += 0.5;
            }
        }
    });

    // Analysis Logic
    const damageableCount = teamStats.damageProfile.AD + teamStats.damageProfile.AP + teamStats.damageProfile.True;
    
    if (damageableCount > 0) {
        const apRatio = teamStats.damageProfile.AP / damageableCount;
        const adRatio = teamStats.damageProfile.AD / damageableCount;

        if (apRatio >= 0.8) warnings.push('Composición FULL AP: El enemigo comprará Resistencia Mágica.');
        if (adRatio >= 0.8) warnings.push('Composición FULL AD: El enemigo comprará Armadura.');
    }

    if (teamStats.score.cc < 3 && championsFound >= 3) suggestions.push('Falta Control de Masas (CC)');
    if (teamStats.score.durability < 4 && championsFound >= 3) warnings.push('Composición Frágil: Falta un Tanque o Frontline');
    if (teamStats.score.waveclear < 3 && championsFound >= 3) suggestions.push('Limpieza de oleadas baja');

    return {
        damageProfile: teamStats.damageProfile,
        score: teamStats.score,
        suggestions,
        warnings
    };
}
