import { Trophy, ArrowUp } from 'lucide-react';
import { HextechCard } from '../hextech';
import ProgressChart from './ProgressChart'; // Import Chart

interface LPDataPoint {
  date: string;
  lp: number;
}

interface RankOverviewCardProps {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winrate: number;
  lpHistory?: LPDataPoint[]; // Add optional history prop
}

export default function RankOverviewCard({ tier, rank, lp, wins, losses, winrate, lpHistory }: RankOverviewCardProps) {
  // Determine color based on tier (simplified logic)
  const tierColor = tier === 'GOLD' ? 'text-yellow-400' : tier === 'PLATINUM' ? 'text-teal-400' : 'text-gray-400';
  const progressPercent = Math.min(lp, 100);

  // Rank Icon Mapping — uses CommunityDragon CDN (official Riot assets, no hosting issues)
  const getRankIcon = (tierName: string) => {
    const t = tierName.toLowerCase();
    if (t === 'unranked') {
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/unranked.png';
    }
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${t}.png`;
  };

  return (
    <HextechCard className="h-full relative overflow-hidden group flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-hextech-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-hextech-gold/10 transition-colors duration-500" />

      <h3 className="text-hextech-gold font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
        <Trophy className="w-4 h-4" />
        Ranked Solo/Duo
      </h3>

      <div className="flex items-center gap-6 relative z-10">
        {/* Rank Emblem */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-hextech-gold/20 to-hextech-black border-2 border-hextech-gold/50 flex items-center justify-center shadow-[0_0_15px_rgba(200,170,110,0.2)] overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
          <img 
            src={getRankIcon(tier)} 
            alt={tier} 
            className="w-full h-full object-contain scale-150 relative z-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback Placeholder (Hidden by default, shown on error) */}
          <span className="text-3xl font-black drop-shadow-md absolute inset-0 flex items-center justify-center hidden">
            <span className={tierColor}>{tier[0]}</span>
          </span>
        </div>

        {/* Rank Info */}
        <div className="flex-1">
          <div className={`text-2xl font-black ${tierColor} tracking-tight`}>
            {tier === 'UNRANKED' ? 'UNRANKED' : `${tier} ${rank}`}
          </div>
          <div className="text-gray-400 text-sm mb-3">
            {lp} LP 
            {!['MASTER', 'GRANDMASTER', 'CHALLENGER', 'UNRANKED'].includes(tier) && (
                <span className="text-gray-600 mx-1">/ 100 LP</span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-hextech-black rounded-full overflow-hidden border border-hextech-gold/20">
            <div 
              className="h-full bg-gradient-to-r from-hextech-gold to-yellow-200 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-hextech-gold/10 pt-4 mb-4">
        <div>
          <div className="text-gray-500 text-xs uppercase mb-1">Winrate</div>
          <div className="text-xl font-bold text-white flex items-center gap-1">
            {winrate}%
            <ArrowUp className="w-3 h-3 text-green-400" />
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-xs uppercase mb-1">Record</div>
          <div className="text-sm font-medium text-gray-300">
            <span className="text-green-400">{wins}W</span>
            <span className="mx-1">-</span>
            <span className="text-red-400">{losses}L</span>
          </div>
        </div>
      </div>

      {/* Embedded Progress Chart (LP History) */}
      {lpHistory && (
        <div className="mt-auto pt-4 border-t border-hextech-gold/10">
          <ProgressChart data={lpHistory} />
        </div>
      )}
    </HextechCard>
  );
}
