import { useState, useEffect } from 'react';
import type { Achievement, AchievementProgress, AchievementRarity } from '../../types/gamification';
import gamificationService from '../../services/gamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Star, Lock, ChevronRight } from 'lucide-react';
import { ACHIEVEMENT_RARITY_COLORS, ACHIEVEMENT_CATEGORY_ICONS } from '../../types/gamification';

interface AchievementsWidgetProps {
  compact?: boolean;
}

export default function AchievementsWidget({ compact = false }: AchievementsWidgetProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [achievementsData, progressData] = await Promise.all([
        gamificationService.getAchievements(user.uid),
        gamificationService.getAchievementProgress(user.uid),
      ]);
      setAchievements(achievementsData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForAchievement = (achievementId: string): AchievementProgress | undefined => {
    return progress.find(p => p.achievementId === achievementId);
  };

  const getRarityStyle = (rarity: AchievementRarity) => {
    return {
      borderColor: ACHIEVEMENT_RARITY_COLORS[rarity],
      boxShadow: `0 0 10px ${ACHIEVEMENT_RARITY_COLORS[rarity]}40`,
    };
  };

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  if (loading) {
    return (
      <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-hextech-metal/50 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-hextech-metal/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-hextech-gold" />
            <h3 className="text-lg font-bold text-white">Logros</h3>
          </div>
          <span className="text-sm text-gray-400">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.slice(0, 4).map((achievement) => {
            const achievementProgress = getProgressForAchievement(achievement.id);
            const isUnlocked = !!achievement.unlockedAt;
            
            return (
              <div
                key={achievement.id}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  isUnlocked ? 'opacity-100' : 'opacity-50'
                }`}
                style={isUnlocked ? getRarityStyle(achievement.rarity) : { borderColor: '#374151' }}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-medium text-white truncate">{achievement.title}</div>
                {!isUnlocked && achievementProgress && (
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hextech-gold transition-all"
                      style={{ width: `${achievementProgress.percentage}%` }}
                    />
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <button className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-hextech-gold hover:text-yellow-400 transition-colors">
          Ver todos los logros
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-hextech-gold/20 rounded-lg">
            <Trophy className="w-6 h-6 text-hextech-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Logros & Badges</h3>
            <p className="text-sm text-gray-400">
              {unlockedCount} desbloqueados • {totalPoints} puntos
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-hextech-gold text-black'
                  : 'bg-hextech-metal/50 text-gray-300 hover:bg-hextech-metal'
              }`}
            >
              {category === 'all' ? 'Todos' : ACHIEVEMENT_CATEGORY_ICONS[category as keyof typeof ACHIEVEMENT_CATEGORY_ICONS]}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const achievementProgress = getProgressForAchievement(achievement.id);
          const isUnlocked = !!achievement.unlockedAt;
          
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                isUnlocked ? 'opacity-100' : 'opacity-60 grayscale'
              }`}
              style={isUnlocked ? getRarityStyle(achievement.rarity) : { borderColor: '#374151' }}
            >
              {/* Lock overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-hextech-black/60 rounded-xl z-10">
                  <Lock className="w-6 h-6 text-gray-500" />
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white truncate">{achievement.title}</h4>
                    {isUnlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-hextech-gold/20 text-hextech-gold">
                        +{achievement.points}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{achievement.description}</p>
                  
                  {/* Progress bar for locked achievements */}
                  {!isUnlocked && achievementProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{achievementProgress.currentProgress}/{achievementProgress.targetProgress}</span>
                        <span>{Math.round(achievementProgress.percentage)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-hextech-gold to-yellow-500 transition-all"
                          style={{ width: `${achievementProgress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Unlocked date */}
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-green-400 mt-2">
                      Desbloqueado {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Rarity indicator */}
              <div 
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: ACHIEVEMENT_RARITY_COLORS[achievement.rarity] }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
