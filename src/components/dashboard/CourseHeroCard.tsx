import { Star, Eye } from 'lucide-react';

interface CourseHeroCardProps {
  title: string;
  subtitle: string;
  image: string;
  lessonsCount: number;
  completedCount: number;
  rating: number;
  views: string;
  tags: string[];
  recommended?: boolean;
  compact?: boolean; // New prop
  onClick?: () => void;
}

export default function CourseHeroCard({
  title,
  subtitle,
  image,
  lessonsCount,
  completedCount,
  rating,
  views,
  tags,
  recommended,
  compact,
  onClick
}: CourseHeroCardProps) {
  return (
    <div 
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,170,110,0.3)] border border-hextech-gold/30 hover:border-hextech-gold ${compact ? 'h-[240px]' : 'h-[380px]'}`}
      onClick={onClick}
    >
      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-hextech-black via-hextech-black/60 to-transparent" />
      </div>

      {/* Top Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {tags.slice(0, compact ? 1 : 2).map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-hextech-black/80 border border-hextech-gold/30 text-hextech-gold text-[8px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
            {tag}
          </span>
        ))}
      </div>

      <div className="absolute top-3 right-3">
        <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider rounded">
          {completedCount}/{lessonsCount}
        </span>
      </div>

      {/* Recommended Side Tab - Hidden in compact mode or adjusted */}
      {recommended && !compact && (
        <div className="absolute top-8 right-0 bg-[#c8aa6e] text-hextech-black font-extrabold text-[10px] uppercase tracking-widest py-1 px-3 rounded-l shadow-lg z-10 border-y border-l border-hextech-black">
          RECOMMENDED
        </div>
      )}

      {/* Content */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end h-full ${compact ? 'bg-gradient-to-t from-hextech-black to-transparent' : ''}`}>
        <div className="mb-auto"></div> 
        
        {!compact && (
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            SEASON 16 • COURSE
          </p>
        )}

        {/* Title */}
        <h3 className={`${compact ? 'text-lg' : 'text-3xl'} font-black text-white uppercase leading-none mb-1 drop-shadow-lg group-hover:text-hextech-gold transition-colors line-clamp-2`}>
          {title}
        </h3>
        
        {!compact && (
          <p className="text-gray-300 text-sm mb-6 line-clamp-2">
            {subtitle}
          </p>
        )}

        {/* Footer Info */}
        <div className={`flex items-center justify-between border-t border-white/10 pt-2 ${compact ? 'mt-1' : 'mt-2'}`}>
          <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-hextech-gold fill-hextech-gold" />
              <span className="text-white">{rating.toFixed(1)}</span>
            </div>
            {!compact && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{views}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Hover Overlay (Golden Border Flash) */}
      <div className="absolute inset-0 border-2 border-hextech-gold/0 group-hover:border-hextech-gold/50 transition-all duration-300 rounded-xl pointer-events-none" />
    </div>
  );
}
