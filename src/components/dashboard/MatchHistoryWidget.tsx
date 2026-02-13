import { HextechCard } from '../hextech';

interface MatchData {
  id: string;
  championName: string;
  championId: string;
  role: string;
  win: boolean;
  kda: { k: number; d: number; a: number };
  cs: number;
  gameDuration: number;
  timestamp: number;
  items: number[];
}

interface MatchHistoryWidgetProps {
  matches: MatchData[];
}

export default function MatchHistoryWidget({ matches }: MatchHistoryWidgetProps) {
  const getOutcomeColor = (win: boolean) => win ? 'border-l-4 border-l-green-500 bg-green-900/10' : 'border-l-4 border-l-red-500 bg-red-900/10';

  return (
    <HextechCard className="p-0 overflow-hidden">
      <div className="p-4 border-b border-hextech-gold/20 flex justify-between items-center bg-hextech-black">
        <h3 className="text-hextech-gold font-bold uppercase tracking-wider text-sm">Historial Reciente</h3>
        <button className="text-xs text-hextech-blue hover:text-white transition-colors">Ver Todo</button>
      </div>
      
      <div className="divide-y divide-hextech-gold/10">
        {matches.map((match) => (
          <div key={match.id} className={`p-3 flex items-center justify-between hover:bg-white/5 transition-colors ${getOutcomeColor(match.win)}`}>
            {/* Champion & Outcome */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/${match.championId}.png`} 
                  alt={match.championName}
                  className="w-10 h-10 rounded-full border border-hextech-gold/30"
                />
                <div className="absolute -bottom-1 -right-1 bg-hextech-black text-[10px] px-1 rounded text-gray-400 border border-gray-700">
                  {match.role}
                </div>
              </div>
              <div>
                <div className={`text-sm font-bold ${match.win ? 'text-green-400' : 'text-red-400'}`}>
                  {match.win ? 'Victoria' : 'Derrota'}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s
                </div>
              </div>
            </div>

            {/* KDA & CS */}
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {match.kda.k} / <span className="text-red-400">{match.kda.d}</span> / {match.kda.a}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {match.cs} CS
              </div>
              
              {/* Items */}
              <div className="flex gap-1 justify-end">
                {match.items.filter(id => id > 0).map((id, idx) => (
                    <img 
                        key={idx}
                        src={`https://ddragon.leagueoflegends.com/cdn/15.3.1/img/item/${id}.png`}
                        alt="Item"
                        className="w-5 h-5 rounded border border-gray-700"
                    />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </HextechCard>
  );
}
