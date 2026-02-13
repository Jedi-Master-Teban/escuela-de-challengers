import { HextechCard } from '../hextech';
import { ArrowUpRight } from 'lucide-react';

interface LPDataPoint {
  date: string;
  lp: number;
}

interface ProgressChartProps {
  data: LPDataPoint[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) return null;

  // Chart Logic
  const maxLP = Math.max(...data.map(d => d.lp)) + 20;
  const minLP = Math.min(0, ...data.map(d => d.lp));
  const range = maxLP - minLP;
  
  const width = 100;
  const height = 50;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.lp - minLP) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const lpDiff = lastPoint.lp - firstPoint.lp;

  return (
    <HextechCard className="relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-hextech-gold font-bold uppercase tracking-wider text-sm">Progreso de LP</h3>
          <p className="text-gray-400 text-xs">Últimos 7 días</p>
        </div>
        <div className={`flex items-center gap-1 font-bold ${lpDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {lpDiff >= 0 ? '+' : ''}{lpDiff} LP
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full aspect-[2/1] relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8aa6e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c8aa6e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1="0" y1={height} x2={width} y2={height} stroke="#c8aa6e" strokeOpacity="0.2" strokeWidth="0.5" />
          <line x1="0" y1="0" x2={width} y2="0" stroke="#c8aa6e" strokeOpacity="0.1" strokeWidth="0.5" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#c8aa6e" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="drop-shadow-[0_0_4px_rgba(200,170,110,0.5)]"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const [cx, cy] = p.split(',');
            return (
              <circle 
                key={i} 
                cx={cx} 
                cy={cy} 
                r="1.5" 
                fill="#111" 
                stroke="#c8aa6e" 
                strokeWidth="1"
                className="hover:r-2 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
    </HextechCard>
  );
}
