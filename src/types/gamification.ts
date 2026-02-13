// Gamification Types for Fase 4

export type AchievementCategory = 
  | 'learning'      // Complete lessons/courses
  | 'performance'   // In-game performance
  | 'consistency'   // Daily streaks
  | 'social'        // Community interactions
  | 'mastery'       // Champion/item mastery
  | 'special';      // Special events

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  points: number;
  requirement: number;
  unlockedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: Date;
  isVisible: boolean;
}

export interface UserRank {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  level: number;
  rank: number;
  achievements: number;
  rankChange?: number; // Position change from last period
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cost: number;
  type: 'cosmetic' | 'feature' | 'currency';
  isClaimed: boolean;
  isAvailable: boolean;
}

export interface GamificationProfile {
  userId: string;
  totalPoints: number;
  level: number;
  currentXP: number;
  requiredXP: number;
  streakDays: number;
  achievements: Achievement[];
  badges: Badge[];
  rank: number;
  totalUsers: number;
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  rankings: UserRank[];
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  targetProgress: number;
  percentage: number;
  isCompleted: boolean;
}

export const ACHIEVEMENT_RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

export const ACHIEVEMENT_CATEGORY_ICONS: Record<AchievementCategory, string> = {
  learning: '📚',
  performance: '⚔️',
  consistency: '🔥',
  social: '🤝',
  mastery: '⭐',
  special: '🎉',
};

export const LEVEL_THRESHOLDS = [
  { level: 1, requiredXP: 0 },
  { level: 2, requiredXP: 100 },
  { level: 3, requiredXP: 250 },
  { level: 4, requiredXP: 500 },
  { level: 5, requiredXP: 1000 },
  { level: 6, requiredXP: 2000 },
  { level: 7, requiredXP: 4000 },
  { level: 8, requiredXP: 8000 },
  { level: 9, requiredXP: 16000 },
  { level: 10, requiredXP: 32000 },
];
