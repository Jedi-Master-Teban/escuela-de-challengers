import { Swords, Trophy, Target, Eye, Zap } from 'lucide-react';
import { HextechCard } from '../hextech';

interface StatsSummaryProps {
  kda: string;
  winrate: string;
  csPerMin: string;
  visionPerMin: string;
  damagePerMin: string;
  // Dynamic Subtitles
  kdaSub?: string;
  winrateSub?: string;
  csSub?: string;
  visionSub?: string;
  damageSub?: string;
}

export default function StatsSummary({ 
  kda, winrate, csPerMin, visionPerMin, damagePerMin,
  kdaSub = 'Ratio',
  winrateSub = 'Games',
  csSub = 'CS/Min',
  visionSub = 'Puntos',
  damageSub = 'Daño'
}: StatsSummaryProps) {
  const stats = [
    { label: 'KDA', value: kda, icon: Swords, color: 'text-blue-400', sub: kdaSub },
    { label: 'Winrate', value: winrate, icon: Trophy, color: 'text-yellow-400', sub: winrateSub },
    { label: 'CS/Min', value: csPerMin, icon: Target, color: 'text-green-400', sub: csSub },
    { label: 'Vision', value: visionPerMin, icon: Eye, color: 'text-purple-400', sub: visionSub },
    { label: 'DPM', value: damagePerMin, icon: Zap, color: 'text-red-400', sub: damageSub },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <HextechCard key={stat.label} className="relative group overflow-hidden">
          {/* Background Icon Opacity */}
          <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity rotate-12`} />
          
          <div className="relative z-10 flex flex-col items-center justify-center py-2">
            <div className={`p-2 rounded-full bg-hextech-black border border-hextech-gold/20 mb-2 ${stat.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
              <stat.icon className="w-5 h-5" />
            </div>
            
            <div className={`text-xl md:text-2xl font-black ${stat.color} drop-shadow-md text-center max-w-full px-1`}>
              {stat.value}
            </div>
            
            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              {stat.label}
            </div>
            
            <div className={`text-gray-600 text-[9px] mt-1 ${stat.label === 'Winrate' ? 'text-hextech-gold' : ''}`}>
              {stat.sub}
            </div>
          </div>
        </HextechCard>
      ))}
    </div>
  );
}
