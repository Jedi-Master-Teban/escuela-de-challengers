import { useState, useEffect } from 'react';
import type { Reward } from '../../types/gamification';
import gamificationService from '../../services/gamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { Gift, Star, Lock, Check, Sparkles } from 'lucide-react';
import { HextechButton } from '../hextech';

interface RewardsWidgetProps {
  compact?: boolean;
}

export default function RewardsWidget({ compact = false }: RewardsWidgetProps) {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRewards();
  }, [user]);

  const loadRewards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await gamificationService.getRewards(user.uid);
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (rewardId: string) => {
    if (!user) return;
    setClaiming(rewardId);
    try {
      const result = await gamificationService.claimReward(user.uid, rewardId);
      setClaimMessage({ type: result.success ? 'success' : 'error', text: result.message });
      
      if (result.success) {
        // Refresh rewards
        await loadRewards();
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setClaimMessage(null), 3000);
    } catch (error) {
      setClaimMessage({ type: 'error', text: 'Error al reclamar la recompensa' });
    } finally {
      setClaiming(null);
    }
  };

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'cosmetic':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'feature':
        return <Star className="w-5 h-5 text-blue-400" />;
      case 'currency':
        return <Gift className="w-5 h-5 text-green-400" />;
    }
  };

  const availableRewards = rewards.filter(r => r.isAvailable && !r.isClaimed);
  const claimedRewards = rewards.filter(r => r.isClaimed);

  if (loading) {
    return (
      <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-hextech-metal/50 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-hextech-metal/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-hextech-gold" />
            <h3 className="text-lg font-bold text-white">Recompensas</h3>
          </div>
          <span className="text-xs text-gray-400">{availableRewards.length} disponibles</span>
        </div>
        
        {claimMessage && (
          <div className={`mb-3 p-2 rounded-lg text-sm ${
            claimMessage.type === 'success' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {claimMessage.text}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {rewards.slice(0, 4).map((reward) => (
            <div
              key={reward.id}
              className={`relative p-3 rounded-lg border transition-all ${
                reward.isClaimed
                  ? 'bg-green-500/10 border-green-500/30 opacity-75'
                  : reward.isAvailable
                    ? 'bg-hextech-metal/30 border-hextech-gold/30'
                    : 'bg-gray-800/50 border-gray-700/50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {reward.isClaimed ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  getRewardIcon(reward.type)
                )}
                <span className={`text-xs font-medium ${
                  reward.isClaimed ? 'text-green-400' : 'text-white'
                }`}>
                  {reward.title}
                </span>
              </div>
              
              {!reward.isClaimed && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-hextech-gold font-bold">{reward.cost}</span>
                  <HextechButton
                    size="sm"
                    variant={reward.isAvailable ? 'primary' : 'secondary'}
                    disabled={!reward.isAvailable || claiming === reward.id}
                    isLoading={claiming === reward.id}
                    onClick={() => handleClaim(reward.id)}
                  >
                    {reward.isAvailable ? 'Canjear' : 'Bloqueado'}
                  </HextechButton>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-hextech-gold/20 rounded-lg">
            <Gift className="w-6 h-6 text-hextech-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tienda de Recompensas</h3>
            <p className="text-sm text-gray-400">
              Canjea tus puntos por recompensas exclusivas
            </p>
          </div>
        </div>
        
        {claimMessage && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            claimMessage.type === 'success' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {claimMessage.text}
          </div>
        )}
      </div>

      {/* Available Rewards */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-hextech-gold" />
          Disponibles ({availableRewards.length})
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className="relative p-4 rounded-xl bg-gradient-to-br from-hextech-metal/30 to-transparent border border-hextech-gold/30 hover:border-hextech-gold/50 transition-all group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-hextech-gold/20 rounded-lg">
                  {getRewardIcon(reward.type)}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-hextech-gold/20 text-hextech-gold capitalize">
                  {reward.type}
                </span>
              </div>
              
              <h5 className="font-bold text-white mb-1">{reward.title}</h5>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{reward.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-hextech-gold fill-current" />
                  <span className="font-bold text-hextech-gold">{reward.cost}</span>
                </div>
                
                <HextechButton
                  size="sm"
                  variant="primary"
                  disabled={claiming === reward.id}
                  isLoading={claiming === reward.id}
                  onClick={() => handleClaim(reward.id)}
                >
                  Canjear
                </HextechButton>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-hextech-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Claimed Rewards */}
      {claimedRewards.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Reclamados ({claimedRewards.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {claimedRewards.map((reward) => (
              <div
                key={reward.id}
                className="relative p-4 rounded-xl bg-green-500/5 border border-green-500/20 opacity-75"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 capitalize">
                    {reward.type}
                  </span>
                </div>
                
                <h5 className="font-bold text-white mb-1">{reward.title}</h5>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{reward.description}</p>
                
                <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Reclamado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Rewards */}
      {rewards.filter(r => !r.isAvailable && !r.isClaimed).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            Bloqueados
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.filter(r => !r.isAvailable && !r.isClaimed).map((reward) => (
              <div
                key={reward.id}
                className="relative p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 opacity-50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    {getRewardIcon(reward.type)}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 capitalize">
                    {reward.type}
                  </span>
                </div>
                
                <h5 className="font-bold text-gray-300 mb-1">{reward.title}</h5>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{reward.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span className="font-bold text-gray-500">{reward.cost}</span>
                  </div>
                  
                  <HextechButton
                    size="sm"
                    variant="secondary"
                    disabled
                  >
                    Bloqueado
                  </HextechButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
