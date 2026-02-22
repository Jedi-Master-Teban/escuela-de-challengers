import type {
  Achievement,
  GamificationProfile,
  Leaderboard,
  Reward,
  UserRank,
  AchievementProgress,
} from '../types/gamification';

// Mock achievements database
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'Primeros Pasos',
    description: 'Completa tu primera lección',
    category: 'learning',
    rarity: 'common',
    icon: '📖',
    points: 50,
    requirement: 1,
  },
  {
    id: 'five_lessons',
    title: 'Estudiante Aplicado',
    description: 'Completa 5 lecciones',
    category: 'learning',
    rarity: 'uncommon',
    icon: '📚',
    points: 100,
    requirement: 5,
  },
  {
    id: 'first_course',
    title: 'Graduado',
    description: 'Completa tu primer curso completo',
    category: 'learning',
    rarity: 'rare',
    icon: '🎓',
    points: 500,
    requirement: 1,
  },
  {
    id: 'streak_7',
    title: 'Constancia Diaria',
    description: 'Mantén una racha de 7 días',
    category: 'consistency',
    rarity: 'uncommon',
    icon: '🔥',
    points: 200,
    requirement: 7,
  },
  {
    id: 'streak_30',
    title: 'Maestro de la Disciplina',
    description: 'Mantén una racha de 30 días',
    category: 'consistency',
    rarity: 'epic',
    icon: '⚡',
    points: 1000,
    requirement: 30,
  },
  {
    id: 'perfect_quiz',
    description: 'Obtén puntuación perfecta en un quiz',
    category: 'learning',
    rarity: 'rare',
    icon: '💯',
    points: 150,
    requirement: 1,
    title: 'Perfección',
  },
  {
    id: 'champion_master',
    description: 'Explora todos los campeones',
    category: 'mastery',
    rarity: 'epic',
    icon: '⚔️',
    points: 800,
    requirement: 1,
    title: 'Maestro de Campeones',
  },
  {
    id: 'item_expert',
    description: 'Revisa todas las builds de objetos',
    category: 'mastery',
    rarity: 'rare',
    icon: '🛡️',
    points: 300,
    requirement: 1,
    title: 'Experto en Items',
  },
  {
    id: 'first_link',
    title: 'Conectado',
    description: 'Vincula tu cuenta de Riot',
    category: 'special',
    rarity: 'common',
    icon: '🔗',
    points: 100,
    requirement: 1,
  },
  {
    id: 'social_share',
    title: 'Compartidor',
    description: 'Comparte tu progreso en redes',
    category: 'social',
    rarity: 'common',
    icon: '📢',
    points: 75,
    requirement: 1,
  },
];

// Mock rewards database
export const MOCK_REWARDS: Reward[] = [
  {
    id: 'gold_border',
    title: 'Borde Dorado',
    description: 'Borde de perfil dorado exclusivo',
    imageUrl: 'border-gold',
    cost: 500,
    type: 'cosmetic',
    isClaimed: false,
    isAvailable: true,
  },
  {
    id: 'special_title',
    title: 'Título "Challenger"',
    description: 'Título especial para tu perfil',
    imageUrl: 'title-challenger',
    cost: 1000,
    type: 'cosmetic',
    isClaimed: false,
    isAvailable: true,
  },
  {
    id: 'xp_boost',
    title: 'Boost de XP',
    description: '2x XP por 24 horas',
    imageUrl: 'boost-xp',
    cost: 300,
    type: 'feature',
    isClaimed: false,
    isAvailable: true,
  },
  {
    id: 'exclusive_rune',
    title: ' skin de Runas',
    description: ' skin de runas exclusivo',
    imageUrl: 'rune-skin',
    cost: 750,
    type: 'cosmetic',
    isClaimed: false,
    isAvailable: true,
  },
];

// Mock leaderboard data
const MOCK_RANKINGS: UserRank[] = [
  {
    userId: '1',
    displayName: 'Faker',
    avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg',
    totalPoints: 15420,
    level: 10,
    rank: 1,
    achievements: 28,
    rankChange: 0,
  },
  {
    userId: '2',
    displayName: 'Caps',
    avatarUrl: undefined,
    totalPoints: 14850,
    level: 10,
    rank: 2,
    achievements: 25,
    rankChange: 1,
  },
  {
    userId: '3',
    displayName: 'Chovy',
    avatarUrl: undefined,
    totalPoints: 14200,
    level: 9,
    rank: 3,
    achievements: 24,
    rankChange: -1,
  },
  {
    userId: '4',
    displayName: 'Knight',
    avatarUrl: undefined,
    totalPoints: 13800,
    level: 9,
    rank: 4,
    achievements: 22,
    rankChange: 2,
  },
  {
    userId: '5',
    displayName: 'Bin',
    avatarUrl: undefined,
    totalPoints: 13100,
    level: 8,
    rank: 5,
    achievements: 20,
    rankChange: -1,
  },
];

class GamificationService {
  private profileCache: Map<string, GamificationProfile> = new Map();

  // Get user's gamification profile
  async getUserProfile(userId: string): Promise<GamificationProfile> {
    // Simulate API call
    await this.simulateDelay();

    if (this.profileCache.has(userId)) {
      return this.profileCache.get(userId)!;
    }

    // Generate mock profile
    const profile: GamificationProfile = {
      userId,
      totalPoints: Math.floor(Math.random() * 5000) + 1000,
      level: Math.floor(Math.random() * 5) + 1,
      currentXP: Math.floor(Math.random() * 500),
      requiredXP: 500,
      streakDays: Math.floor(Math.random() * 14),
      achievements: MOCK_ACHIEVEMENTS.slice(0, 5).map(a => ({
        ...a,
        unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      })),
      badges: [],
      rank: Math.floor(Math.random() * 100) + 1,
      totalUsers: 1250,
    };

    this.profileCache.set(userId, profile);
    return profile;
  }

  // Get all achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    await this.simulateDelay();
    const userProfile = await this.getUserProfile(userId);
    const unlockedIds = new Set(
      userProfile.achievements.map(a => a.id)
    );

    return MOCK_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlockedAt: achievement.id in unlockedIds 
        ? userProfile.achievements.find(a => a.id === achievement.id)?.unlockedAt 
        : undefined,
    }));
  }

  // Get achievement progress
  async getAchievementProgress(_userId: string): Promise<AchievementProgress[]> {
    await this.simulateDelay();
    
    // Mock progress data
    const progress: AchievementProgress[] = MOCK_ACHIEVEMENTS.slice(0, 5).map(a => ({
      achievementId: a.id,
      currentProgress: Math.floor(Math.random() * a.requirement),
      targetProgress: a.requirement,
      percentage: Math.random() * 100,
      isCompleted: false,
    }));

    return progress;
  }

  // Get leaderboard
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'allTime' = 'weekly'): Promise<Leaderboard> {
    await this.simulateDelay();
    
    return {
      period,
      rankings: MOCK_RANKINGS,
    };
  }

  // Get available rewards
  async getRewards(userId: string): Promise<Reward[]> {
    await this.simulateDelay();
    const profile = await this.getUserProfile(userId);
    
    return MOCK_REWARDS.map(reward => ({
      ...reward,
      isAvailable: profile.totalPoints >= reward.cost,
    }));
  }

  // Claim a reward
  async claimReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }> {
    await this.simulateDelay();
    
    const profile = await this.getUserProfile(userId);
    const reward = MOCK_REWARDS.find(r => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: 'Recompensa no encontrada' };
    }
    
    if (profile.totalPoints < reward.cost) {
      return { success: false, message: 'Puntos insuficientes' };
    }
    
    if (reward.isClaimed) {
      return { success: false, message: 'Ya has reclamar esta recompensa' };
    }

    // In a real app, this would update the database
    return { success: true, message: '¡Recompensa reclamada exitosamente!' };
  }

  // Add XP to user
  async addXP(userId: string, amount: number): Promise<{ newLevel: number; leveledUp: boolean }> {
    const profile = await this.getUserProfile(userId);
    let newXP = profile.currentXP + amount;
    let newLevel = profile.level;
    let leveledUp = false;

    while (newXP >= profile.requiredXP) {
      newXP -= profile.requiredXP;
      newLevel++;
      leveledUp = true;
    }

    return { newLevel, leveledUp };
  }

  // Get level progress percentage
  getLevelProgress(currentXP: number, requiredXP: number): number {
    return Math.min((currentXP / requiredXP) * 100, 100);
  }

  // Calculate total points needed for a level
  calculateXPForLevel(level: number): number {
    const baseXP = 100;
    const multiplier = 1.5;
    return Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
