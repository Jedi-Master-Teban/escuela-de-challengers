// ChampionDetail - Shows detailed stats and abilities for a champion
import { useState, useEffect } from 'react';
import type { ChampionDetail, ChampionSummary } from '../../types/dataDragon';
import { ROLE_TRANSLATIONS } from '../../types/dataDragon';
import { 
  getChampionDetail, 
  getChampionSplashUrl,
  getSpellIconUrl,
  getPassiveIconUrl,
  calculateStatAtLevel,
  formatStat
} from '../../services/dataDragonService';
import { HextechCard } from '../hextech';

interface ChampionDetailPanelProps {
  champion: ChampionSummary;
}

const STAT_LABELS: Record<string, { label: string; icon: string; decimals?: number }> = {
  hp: { label: 'Vida', icon: '❤️' },
  mp: { label: 'Maná', icon: '💧' },
  armor: { label: 'Armadura', icon: '🛡️' },
  spellblock: { label: 'RM', icon: '✨' },
  attackdamage: { label: 'AD', icon: '⚔️' },
  attackspeed: { label: 'AS', icon: '⚡', decimals: 3 },
  movespeed: { label: 'MS', icon: '👟' },
  attackrange: { label: 'Rango', icon: '🎯' },
  hpregen: { label: 'Regen HP', icon: '💚', decimals: 1 },
  mpregen: { label: 'Regen MP', icon: '💙', decimals: 1 },
};

const SPELL_KEYS = ['Q', 'W', 'E', 'R'];

export default function ChampionDetailPanel({ champion }: ChampionDetailPanelProps) {
  const [detail, setDetail] = useState<ChampionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities'>('stats');

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      const data = await getChampionDetail(champion.id);
      setDetail(data);
      setLoading(false);
    }
    loadDetail();
  }, [champion.id]);

  if (loading) {
    return (
      <HextechCard className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hextech-gold" />
        </div>
      </HextechCard>
    );
  }

  if (!detail) {
    return (
      <HextechCard className="p-6">
        <p className="text-red-400">Error cargando detalles del campeón</p>
      </HextechCard>
    );
  }

  const getStatAtLevel = (statKey: string) => {
    const base = detail.stats[statKey as keyof typeof detail.stats] as number;
    const growth = detail.stats[`${statKey}perlevel` as keyof typeof detail.stats] as number;
    
    if (growth === undefined) return base;
    return calculateStatAtLevel(base, growth, level);
  };

  return (
    <div className="space-y-4">
      {/* Champion Header with Splash */}
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={getChampionSplashUrl(champion.id)}
          alt={champion.name}
          className="w-full h-48 object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-hextech-black via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white">{champion.name}</h2>
          <p className="text-hextech-gold">{champion.title}</p>
          <div className="flex gap-2 mt-2">
            {champion.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-hextech-blue/50 text-gray-300 rounded"
              >
                {ROLE_TRANSLATIONS[tag] || tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hextech-gold/20">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium transition-colors
            ${activeTab === 'stats'
              ? 'text-hextech-gold border-b-2 border-hextech-gold'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          📊 Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={`px-4 py-2 font-medium transition-colors
            ${activeTab === 'abilities'
              ? 'text-hextech-gold border-b-2 border-hextech-gold'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          ⚡ Habilidades
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <HextechCard className="p-4">
          {/* Level Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Nivel</span>
              <span className="text-hextech-gold font-bold text-xl">{level}</span>
            </div>
            <input
              type="range"
              min="1"
              max="18"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full h-2 bg-hextech-blue/30 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-hextech-gold [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-hextech-gold/30"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>18</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(STAT_LABELS).map(([key, { label, icon, decimals = 0 }]) => {
              const value = getStatAtLevel(key);
              const baseValue = detail.stats[key as keyof typeof detail.stats] as number;
              
              return (
                <div
                  key={key}
                  className="p-3 bg-hextech-blue/20 rounded-lg border border-hextech-gold/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{icon}</span>
                    <span className="text-gray-400 text-sm">{label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-lg">
                      {formatStat(value, decimals)}
                    </span>
                    {level > 1 && value !== baseValue && (
                      <span className="text-green-400 text-xs">
                        (+{formatStat(value - baseValue, decimals)})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </HextechCard>
      )}

      {/* Abilities Tab */}
      {activeTab === 'abilities' && (
        <div className="space-y-3">
          {/* Passive */}
          <HextechCard className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={getPassiveIconUrl(detail.passive.image.full)}
                    alt={detail.passive.name}
                    className="w-12 h-12 rounded border border-hextech-gold/30"
                  />
                  <span className="absolute -top-1 -left-1 bg-gray-600 text-white text-xs 
                    w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    P
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-hextech-gold font-semibold">{detail.passive.name}</h4>
                <p 
                  className="text-gray-300 text-sm mt-1"
                  dangerouslySetInnerHTML={{ 
                    __html: detail.passive.description.replace(/<br\s*\/?>/gi, ' ') 
                  }}
                />
              </div>
            </div>
          </HextechCard>

          {/* Spells Q W E R */}
          {detail.spells.map((spell, index) => (
            <HextechCard key={spell.id} className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={getSpellIconUrl(spell.image.full)}
                      alt={spell.name}
                      className="w-12 h-12 rounded border border-hextech-gold/30"
                    />
                    <span className="absolute -top-1 -left-1 bg-hextech-gold text-hextech-black text-xs 
                      w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {SPELL_KEYS[index]}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-hextech-gold font-semibold">{spell.name}</h4>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>⏱️ {spell.cooldownBurn}s</span>
                      <span>💧 {spell.costBurn}</span>
                    </div>
                  </div>
                  <p 
                    className="text-gray-300 text-sm mt-1"
                    dangerouslySetInnerHTML={{ 
                      __html: spell.description.replace(/<br\s*\/?>/gi, ' ') 
                    }}
                  />
                </div>
              </div>
            </HextechCard>
          ))}
        </div>
      )}
    </div>
  );
}
