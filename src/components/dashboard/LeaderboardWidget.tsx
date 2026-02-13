import { useState, useEffect } from 'react';
import type { Leaderboard } from '../../types/gamification';
import gamificationService from '../../services/gamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Target } from 'lucide-react';

interface LeaderboardWidgetProps {
  compact?: boolean;
}

export default function LeaderboardWidget({ compact = false }: LeaderboardWidgetProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, [period, user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await gamificationService.getLeaderboard(period);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (change?: number) => {
    if (!change) return <Minus className="w-3 h-3 text-gray-500" />;
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  const getTierColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-transparent border-yellow-500/50';
    if (rank <= 3) return 'from-gray-400/10 to-transparent border-gray-400/30';
    return 'from-hextech-metal/20 to-transparent border-hextech-gold/20';
  };

  if (loading) {
    return (
      <div className="bg-hextech-black/50 border border-hextech-gold/20 rounded-xl p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-hextech-metal/50 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-hextech-metal/50 rounded"></div>
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
            <Trophy className="w-5 h-5 text-hextech-gold" />
            <h3 className="text-lg font-bold text-white">Ranking</h3>
          </div>
          <span className="text-xs text-gray-400 capitalize">{period}</span>
        </div>
        
        <div className="space-y-2">
          {leaderboard?.rankings.slice(0, 5).map((userRank) => (
            <div
              key={userRank.userId}
              className={`flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r ${getTierColor(userRank.rank)} border`}
            >
              {getRankIcon(userRank.rank)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userRank.displayName}</p>
                <p className="text-xs text-gray-400">Nivel {userRank.level} • {userRank.achievements} logros</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-hextech-gold">{userRank.totalPoints.toLocaleString()}</p>
                <p className="text-xs text-gray-500">pts</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-hextech-gold hover:text-yellow-400 transition-colors">
          Ver ranking completo
          <Target className="w-4 h-4" />
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
            <h3 className="text-xl font-bold text-white">Clasificación</h3>
            <p className="text-sm text-gray-400">Compite con otros invocadores</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                period === p
                  ? 'bg-hextech-gold text-black'
                  : 'bg-hextech-metal/50 text-gray-300 hover:bg-hextech-metal'
              }`}
            >
              {p === 'daily' ? 'Día' : p === 'weekly' ? 'Semana' : p === 'monthly' ? 'Mes' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {period === 'weekly' && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-2xl border-2 border-gray-400">
                {leaderboard?.rankings[1]?.displayName.charAt(0) || '?'}
              </div>
              <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-0.5">
                {getRankIcon(2)}
              </div>
            </div>
            <div className="w-20 h-12 bg-gradient-to-t from-gray-400/30 to-gray-400/10 rounded-t-lg mt-2 flex items-end justify-center pb-1">
              <span className="text-sm font-bold text-gray-300">{leaderboard?.rankings[1]?.totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-white mt-1">{leaderboard?.rankings[1]?.displayName}</p>
            <p className="text-xs text-gray-400">Nivel {leaderboard?.rankings[1]?.level}</p>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-3xl border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                {leaderboard?.rankings[0]?.displayName.charAt(0) || '?'}
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                {getRankIcon(1)}
              </div>
            </div>
            <div className="w-24 h-16 bg-gradient-to-t from-yellow-500/30 to-yellow-500/10 rounded-t-lg mt-2 flex items-end justify-center pb-1">
              <span className="text-lg font-bold text-yellow-400">{leaderboard?.rankings[0]?.totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-lg font-bold text-white mt-1">{leaderboard?.rankings[0]?.displayName}</p>
            <p className="text-xs text-gray-400">Nivel {leaderboard?.rankings[0]?.level}</p>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl border-2 border-amber-600">
                {leaderboard?.rankings[2]?.displayName.charAt(0) || '?'}
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-600 rounded-full p-0.5">
                {getRankIcon(3)}
              </div>
            </div>
            <div className="w-20 h-8 bg-gradient-to-t from-amber-700/30 to-amber-700/10 rounded-t-lg mt-2 flex items-end justify-center pb-1">
              <span className="text-sm font-bold text-amber-600">{leaderboard?.rankings[2]?.totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-white mt-1">{leaderboard?.rankings[2]?.displayName}</p>
            <p className="text-xs text-gray-400">Nivel {leaderboard?.rankings[2]?.level}</p>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="space-y-2">
        {leaderboard?.rankings.slice(0, 10).map((userRank) => (
          <div
            key={userRank.userId}
            className={`flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r ${getTierColor(userRank.rank)} border transition-all hover:bg-hextech-metal/30`}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(userRank.rank)}
            </div>
            
            <div className="w-8 h-8 rounded-full bg-hextech-metal/50 flex items-center justify-center text-sm font-bold text-white">
              {userRank.displayName.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white truncate">{userRank.displayName}</p>
                {userRank.rankChange !== undefined && userRank.rankChange !== 0 && (
                  <span className="flex items-center gap-0.5 text-xs">
                    {getRankChangeIcon(userRank.rankChange)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Nivel {userRank.level} • {userRank.achievements} logros
              </p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-hextech-gold">{userRank.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500">puntos</p>
            </div>
          </div>
        ))}
      </div>

      {/* Your Position */}
      {user && (
        <div className="mt-6 p-4 bg-hextech-gold/10 border border-hextech-gold/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-hextech-metal/50 flex items-center justify-center text-lg font-bold text-white">
                Tu
              </div>
              <div>
                <p className="font-medium text-white">Tu posición</p>
                <p className="text-sm text-gray-400">Continúa mejorando para subir en el ranking</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-hextech-gold">#{Math.floor(Math.random() * 100) + 100}</p>
              <p className="text-xs text-gray-400">de {leaderboard?.rankings.length || 0} invocadores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
