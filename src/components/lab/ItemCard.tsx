import { useState } from 'react';
import { Coins } from 'lucide-react';
import type { Item } from '../../services/dataDragon/itemService';
import { getItemImageUrl, STAT_LABELS } from '../../services/dataDragon/itemService';

interface ItemCardProps {
  item: Item;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export default function ItemCard({ item, size = 'md', showTooltip = true }: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const borderColors: Record<string, string> = {
    Damage: 'border-red-500/50 hover:border-red-400',
    SpellDamage: 'border-purple-500/50 hover:border-purple-400',
    Health: 'border-green-500/50 hover:border-green-400',
    Armor: 'border-yellow-700/50 hover:border-yellow-600',
    SpellBlock: 'border-blue-500/50 hover:border-blue-400',
    Boots: 'border-cyan-500/50 hover:border-cyan-400',
    default: 'border-gray-600/50 hover:border-gray-500'
  };

  const getBorderColor = () => {
    if (!item.tags) return borderColors.default;
    for (const tag of item.tags) {
      if (borderColors[tag]) return borderColors[tag];
    }
    return borderColors.default;
  };

  // Parse stats for tooltip
  const getFormattedStats = () => {
    if (!item.stats) return [];
    return Object.entries(item.stats)
      .filter(([_, value]) => value !== 0)
      .map(([stat, value]) => ({
        label: STAT_LABELS[stat] || stat,
        value: stat.includes('Percent') ? `${(value * 100).toFixed(0)}%` : `+${value}`
      }));
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`
          ${sizes[size]} 
          rounded-lg border-2 overflow-hidden bg-gray-800 
          ${getBorderColor()} 
          transition-all duration-200 cursor-pointer
          hover:scale-105 hover:shadow-lg hover:shadow-black/50
        `}
      >
        <img
          src={getItemImageUrl(item.image.full)}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-yellow-400 leading-tight">{item.name}</h4>
            <div className="flex items-center gap-1 shrink-0">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">{item.gold.total}</span>
            </div>
          </div>

          {/* Description */}
          {item.plaintext && (
            <p className="text-xs text-gray-400 mb-3">{item.plaintext}</p>
          )}

          {/* Stats */}
          {getFormattedStats().length > 0 && (
            <div className="space-y-1 pt-2 border-t border-gray-700">
              {getFormattedStats().map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-green-400 font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recipe indicator */}
          {item.from && item.from.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-500">
                Se construye de {item.from.length} componente{item.from.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
