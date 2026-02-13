import { useState, useEffect, useMemo } from 'react';
import { Trash2, Sparkles, Calculator, Zap } from 'lucide-react';
import type { RuneTree, Rune } from '../../services/dataDragon/runeService';
import { 
  getRuneTrees, 
  getRuneIconUrl, 
  RUNE_TREE_COLORS, 
  cleanDescription,
  STAT_SHARDS,
  STAT_SHARDS_BY_SLOT,
  getStatShardsBySlot,
  type StatShard
} from '../../services/dataDragon/runeService';

// Stats type definition
interface RuneStats {
  adaptive: number;
  attackSpeed: number;
  abilityHaste: number;
  armor: number;
  magicResist: number;
  health: number;
}

// Shard selection type - track which shard is selected for each slot
interface ShardSelection {
  [slot: number]: number | null; // slot -> shard ID
}

export default function RuneBuilder() {
  const [runeTrees, setRuneTrees] = useState<RuneTree[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder State
  const [primaryTree, setPrimaryTree] = useState<number | null>(null);
  const [keystone, setKeystone] = useState<number | null>(null);
  const [primaryRunes, setPrimaryRunes] = useState<number[]>([]);
  const [secondaryTree, setSecondaryTree] = useState<number | null>(null);
  const [secondaryRunes, setSecondaryRunes] = useState<number[]>([]);
  // Track shard selection by slot: { 0: shardId, 1: shardId, 2: shardId }
  const [shardSelections, setShardSelections] = useState<ShardSelection>({
    0: 5008, // Default: Fuerza Adaptativa (Slot 0)
    1: 5002, // Default: Armadura (Slot 1)
    2: 5001, // Default: Vida (Slot 2)
  });

  useEffect(() => {
    async function loadRunes() {
      try {
        const trees = await getRuneTrees();
        setRuneTrees(trees);
        if (trees.length > 0) {
          const precisionTree = trees.find(t => t.key === 'Precision');
          setPrimaryTree(precisionTree?.id || trees[0].id);
        }
      } catch (error) {
        console.error('Failed to load runes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRunes();
  }, []);

  const currentPrimaryTree = useMemo(() => 
    runeTrees.find(t => t.id === primaryTree), 
  [runeTrees, primaryTree]);

  const currentSecondaryTree = useMemo(() => 
    runeTrees.find(t => t.id === secondaryTree), 
  [runeTrees, secondaryTree]);

  const handlePrimaryTreeChange = (treeId: number) => {
    setPrimaryTree(treeId);
    setKeystone(null);
    setPrimaryRunes([]);
    setSecondaryTree(null);
    setSecondaryRunes([]);
  };

  const handleSecondaryTreeSelect = (treeId: number) => {
    setSecondaryTree(treeId);
    setSecondaryRunes([]);
  };

  // Handle shard selection - one per slot, independent
  const handleShardSelect = (shardId: number, slot: number) => {
    setShardSelections(prev => ({
      ...prev,
      [slot]: prev[slot] === shardId ? null : shardId // Toggle
    }));
  };

  // Clear all selections
  const clearPage = () => {
    setKeystone(null);
    setPrimaryRunes([]);
    setSecondaryTree(null);
    setSecondaryRunes([]);
    setShardSelections({
      0: 5008,
      1: 5002,
      2: 5001,
    });
  };

  // Extract stats from a rune description with comprehensive regex patterns
  const extractStatsFromDescription = (desc: string): Partial<RuneStats> => {
    const result: Partial<RuneStats> = {};
    const lowerDesc = desc.toLowerCase();
    
    // Helper function to extract numeric values with various formats
    const extractNumber = (pattern: RegExp): number | null => {
      const match = lowerDesc.match(pattern);
      if (match) {
        // Handle various formats: integer, decimal, percentage
        const value = match[1] || match[2] || match[3] || '0';
        const cleaned = value.replace(/[+%]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    };
    
    // Adaptive Force - handles: "+X Adaptive Force", "X Adaptive", "X fuerza adaptativa", "X%", etc.
    const adaptivePatterns = [
      /([\d.]+)\s*adaptive\s*force/i,
      /([\d.]+)\s*adaptive/i,
      /fuerza[\s]+adaptativa[\s:]+([\d.]+)/i,
      /([\d.]+)\s*fuerza\s*adaptativa/i,
      /\+([\d.]+)\s*adaptive/i,
      /\+([\d.]+)\s*fuerza/i,
    ];
    for (const pattern of adaptivePatterns) {
      const val = extractNumber(pattern);
      if (val !== null) {
        result.adaptive = val;
        break;
      }
    }
    
    // Attack Speed - handles: "X% attack speed", "X% velocidad de ataque", "X.y%" etc.
    const asPatterns = [
      /([\d.]+)%\s*attack\s*speed/i,
      /([\d.]+)%\s*velocidad\s*de\s*ataque/i,
      /attack\s*speed[\s:]+([\d.]+)%?/i,
      /velocidad\s*de\s*ataque[\s:]+([\d.]+)%?/i,
      /([\d.]+)%\s*as/i,
    ];
    for (const pattern of asPatterns) {
      const val = extractNumber(pattern);
      if (val !== null) {
        result.attackSpeed = val;
        break;
      }
    }
    
    // Ability Haste / Celerity / Haste
    const ahPatterns = [
      /celeridad[\s:]+([\d.]+)/i,
      /ability\s*haste[\s:]+([\d.]+)/i,
      /haste[\s:]+([\d.]+)/i,
      /([\d.]+)\s*celerity/i,
      /([\d.]+)\s*ability\s*haste/i,
      /([\d.]+)\s*ah/i,
    ];
    for (const pattern of ahPatterns) {
      const val = extractNumber(pattern);
      if (val !== null) {
        result.abilityHaste = val;
        break;
      }
    }
    
    // Armor - handles: "+X Armor", "X Armadura", "X% armor" etc.
    const armorPatterns = [
      /armor[\s:]+([\d.]+)/i,
      /armadura[\s:]+([\d.]+)/i,
      /([\d.]+)\s*armor/i,
      /([\d.]+)\s*armadura/i,
      /\+([\d.]+)\s*armor/i,
      /\+([\d.]+)\s*armadura/i,
    ];
    for (const pattern of armorPatterns) {
      const val = extractNumber(pattern);
      if (val !== null) {
        result.armor = val;
        break;
      }
    }
    
    // Magic Resist - handles: "+X MR", "X Magic Resist", "X Resistencia Mágica"
    const mrPatterns = [
      /magic\s*resist[\s:]+([\d.]+)/i,
      /resistencia[\s]*m[áa]gica[\s:]+([\d.]+)/i,
      /([\d.]+)\s*magic\s*resist/i,
      /([\d.]+)\s*mr/i,
      /([\d.]+)\s*resistencia[\s]*m[áa]gica/i,
      /\+([\d.]+)\s*mr/i,
    ];
    for (const pattern of mrPatterns) {
      const val = extractNumber(pattern);
      if (val !== null) {
        result.magicResist = val;
        break;
      }
    }
    
    // Health - handles: "+X HP", "X Health", "X Vida", "X% health"
    const hpPatterns = [
      /health[\s:]+([\d.]+)/i,
      /vida[\s:]+([\d.]+)/i,
      /([\d.]+)\s*health/i,
      /([\d.]+)\s*vida/i,
      /([\d.]+)\s*hp/i,
      /\+([\d.]+)\s*health/i,
      /\+([\d.]+)\s*vida/i,
    ];
    for (const pattern of hpPatterns) {
      const val = extractNumber(pattern);
      if (val !== null) {
        result.health = val;
        break;
      }
    }
    
    return result;
  };

  // Calculate total stats from selected runes and shards
  const calculateStats = (): RuneStats => {
    const stats: RuneStats = {
      adaptive: 0,
      attackSpeed: 0,
      abilityHaste: 0,
      armor: 0,
      magicResist: 0,
      health: 0,
    };

    // Add keystones stats (base adaptive bonus)
    if (keystone) {
      stats.adaptive += 9;
    }

    // Add primary rune stats
    if (currentPrimaryTree) {
      [...primaryRunes, keystone].forEach(runeId => {
        const rune = currentPrimaryTree.slots
          .flatMap(s => s.runes)
          .find(r => r.id === runeId);
        
        if (rune) {
          const desc = cleanDescription(rune.longDesc || rune.shortDesc || '');
          const runeStats = extractStatsFromDescription(desc);
          
          if (runeStats.adaptive) stats.adaptive += runeStats.adaptive;
          if (runeStats.attackSpeed) stats.attackSpeed += runeStats.attackSpeed;
          if (runeStats.abilityHaste) stats.abilityHaste += runeStats.abilityHaste;
          if (runeStats.armor) stats.armor += runeStats.armor;
          if (runeStats.magicResist) stats.magicResist += runeStats.magicResist;
          if (runeStats.health) stats.health += runeStats.health;
        }
      });
    }

    // Add secondary rune stats
    if (currentSecondaryTree) {
      secondaryRunes.forEach(runeId => {
        const rune = currentSecondaryTree.slots
          .flatMap(s => s.runes)
          .find(r => r.id === runeId);
        
        if (rune) {
          const desc = cleanDescription(rune.longDesc || rune.shortDesc || '');
          const runeStats = extractStatsFromDescription(desc);
          
          if (runeStats.adaptive) stats.adaptive += runeStats.adaptive;
          if (runeStats.attackSpeed) stats.attackSpeed += runeStats.attackSpeed;
          if (runeStats.abilityHaste) stats.abilityHaste += runeStats.abilityHaste;
          if (runeStats.armor) stats.armor += runeStats.armor;
          if (runeStats.magicResist) stats.magicResist += runeStats.magicResist;
          if (runeStats.health) stats.health += runeStats.health;
        }
      });
    }

    // Add stat shards (one per slot, independent)
    Object.entries(shardSelections).forEach(([slot, shardId]) => {
      if (shardId !== null) {
        const shard = getStatShardsBySlot(parseInt(slot)).find(s => s.id === shardId);
        if (shard) {
          if (shard.stats.adaptive) stats.adaptive += shard.stats.adaptive;
          if (shard.stats.attackSpeed) stats.attackSpeed += shard.stats.attackSpeed;
          if (shard.stats.ah) stats.abilityHaste += shard.stats.ah;
          if (shard.stats.armor) stats.armor += shard.stats.armor;
          if (shard.stats.mr) stats.magicResist += shard.stats.mr;
          if (shard.stats.hp) stats.health += shard.stats.hp;
        }
      }
    });

    return stats;
  };

  const totalStats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando constructor de runas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end gap-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <button
          onClick={clearPage}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Rune Selection */}
        <div className="lg:w-2/3 space-y-6">
          {/* Primary Tree Selector */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Rama Primaria</h3>
            <div className="flex flex-wrap gap-2">
              {runeTrees.map(tree => (
                <button
                  key={tree.id}
                  onClick={() => handlePrimaryTreeChange(tree.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    primaryTree === tree.id ? 'bg-gray-700/50 scale-105' : 'bg-gray-800/40 hover:bg-gray-700/60 border-transparent'
                  }`}
                  style={{ borderColor: primaryTree === tree.id ? RUNE_TREE_COLORS[tree.key] : 'transparent' }}
                >
                  <img src={getRuneIconUrl(tree.icon)} alt={tree.name} className="w-6 h-6" />
                  <span className="text-sm font-medium" style={{ color: primaryTree === tree.id ? RUNE_TREE_COLORS[tree.key] : '#9CA3AF' }}>
                    {tree.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Rune Slots */}
          {currentPrimaryTree && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Runas Primarias</h3>
              {currentPrimaryTree.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="uppercase tracking-wider">{slotIndex === 0 ? 'Keystone' : `Ranura ${slotIndex}`}</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slot.runes.map(rune => {
                      const isSelected = slotIndex === 0 
                        ? keystone === rune.id 
                        : primaryRunes.includes(rune.id);
                      return (
                        <button
                          key={rune.id}
                          onClick={() => {
                            if (slotIndex === 0) {
                              setKeystone(keystone === rune.id ? null : rune.id);
                            } else {
                              if (primaryRunes.includes(rune.id)) {
                                setPrimaryRunes(primaryRunes.filter(r => r !== rune.id));
                              } else {
                                const slotRunes = currentPrimaryTree?.slots[slotIndex]?.runes || [];
                                setPrimaryRunes([...primaryRunes.filter(r => !slotRunes.some(sr => sr.id === r)), rune.id]);
                              }
                            }
                          }}
                          className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${
                            isSelected ? 'bg-gray-600/80 ring-2 ring-current' : 'bg-gray-800/60 hover:bg-gray-700/60'
                          }`}
                          style={{ color: isSelected ? RUNE_TREE_COLORS[currentPrimaryTree.key] : undefined }}
                        >
                          <div className={slotIndex === 0 ? 'w-14 h-14' : 'w-10 h-10'}>
                            <img src={getRuneIconUrl(rune.icon)} alt={rune.name} className="w-full h-full" />
                          </div>
                          <span className="text-[10px] text-gray-300 text-center max-w-[70px] truncate">{rune.name}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-black text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Secondary Tree Selector */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Rama Secundaria</h3>
            <div className="flex flex-wrap gap-2">
              {runeTrees.filter(t => t.id !== primaryTree).map(tree => (
                <button
                  key={tree.id}
                  onClick={() => handleSecondaryTreeSelect(tree.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    secondaryTree === tree.id ? 'bg-gray-700/50' : 'bg-gray-800/40 hover:bg-gray-700/60 border-transparent'
                  }`}
                  style={{ borderColor: secondaryTree === tree.id ? RUNE_TREE_COLORS[tree.key] : 'transparent' }}
                >
                  <span className="text-sm font-medium" style={{ color: secondaryTree === tree.id ? RUNE_TREE_COLORS[tree.key] : '#9CA3AF' }}>
                    {tree.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Rune Slots - All 3 slots visible but max 2 runes total */}
          {currentSecondaryTree && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Runas Secundarias</h3>
                <span className="text-xs text-yellow-400">{secondaryRunes.length}/2 seleccionadas</span>
              </div>
              {currentSecondaryTree.slots.slice(1, 4).map((slot, slotIndex) => (
                <div key={slotIndex} className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="uppercase tracking-wider">{`Ranura ${slotIndex + 1}`}</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slot.runes.map(rune => {
                      const isSelected = secondaryRunes.includes(rune.id);
                      const isDisabled = !isSelected && secondaryRunes.length >= 2;
                      return (
                        <button
                          key={rune.id}
                          onClick={() => {
                            if (secondaryRunes.includes(rune.id)) {
                              setSecondaryRunes(secondaryRunes.filter(r => r !== rune.id));
                            } else if (secondaryRunes.length >= 2) {
                              setSecondaryRunes([secondaryRunes[1], rune.id]);
                            } else {
                              setSecondaryRunes([...secondaryRunes, rune.id]);
                            }
                          }}
                          disabled={isDisabled}
                          className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-gray-600/80 ring-2 ring-current' 
                              : isDisabled 
                                ? 'opacity-40 cursor-not-allowed bg-gray-800/40' 
                                : 'bg-gray-800/60 hover:bg-gray-700/60'
                          }`}
                          style={{ color: isSelected ? RUNE_TREE_COLORS[currentSecondaryTree.key] : undefined }}
                        >
                          <div className="w-10 h-10">
                            <img src={getRuneIconUrl(rune.icon)} alt={rune.name} className="w-full h-full" />
                          </div>
                          <span className="text-[10px] text-gray-300 text-center max-w-[70px] truncate">{rune.name}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-black text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stat Shards - Independent slots */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Fragmentos</h3>
            {STAT_SHARDS_BY_SLOT.map((slotInfo) => {
              const slotShards = getStatShardsBySlot(slotInfo.slot);
              const selectedShardId = shardSelections[slotInfo.slot];
              
              return (
                <div key={slotInfo.slot} className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="uppercase tracking-wider">{slotInfo.name}</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slotShards.map((shard: StatShard) => {
                      const isSelected = selectedShardId === shard.id;
                      return (
                        <button
                          key={shard.id}
                          onClick={() => handleShardSelect(shard.id, shard.slot)}
                          className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer ${
                            isSelected ? 'bg-blue-500/30 ring-2 ring-blue-500' : 'bg-gray-800/60 hover:bg-gray-700/60'
                          }`}
                        >
                          <div className="w-8 h-8">
                            <img src={getRuneIconUrl(shard.icon)} alt={shard.name} className="w-full h-full" />
                          </div>
                          <span className="text-[10px] text-gray-300 text-center max-w-[70px] truncate">{shard.name}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-black text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Stats & Summary */}
        <div className="lg:w-1/3">
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 sticky top-24">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tu Página de Runas
            </h3>

            {/* Primary Tree Summary */}
            <div className="space-y-3 mb-6">
              {currentPrimaryTree && (
                <div className="flex items-center gap-2" style={{ color: RUNE_TREE_COLORS[currentPrimaryTree.key] }}>
                  <img src={getRuneIconUrl(currentPrimaryTree.icon)} alt="" className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-sm">{currentPrimaryTree.name}</p>
                    {keystone && (
                      <p className="text-xs opacity-80">{currentPrimaryTree.slots[0].runes.find(r => r.id === keystone)?.name}</p>
                    )}
                  </div>
                </div>
              )}
              {currentSecondaryTree && secondaryRunes.length > 0 && (
                <div className="flex items-center gap-2" style={{ color: RUNE_TREE_COLORS[currentSecondaryTree.key] }}>
                  <img src={getRuneIconUrl(currentSecondaryTree.icon)} alt="" className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-sm">{currentSecondaryTree.name}</p>
                    <p className="text-xs opacity-80">{secondaryRunes.length} runa(s)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Simulator */}
            <div className="border-t border-gray-700 pt-4 mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Estadísticas Bonificadas
              </h4>
              <div className="space-y-2">
                {totalStats.adaptive > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Fuerza Adaptativa</span>
                    <span className="text-sm font-mono text-green-400">+{totalStats.adaptive}</span>
                  </div>
                )}
                {totalStats.attackSpeed > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Velocidad de Ataque</span>
                    <span className="text-sm font-mono text-green-400">+{totalStats.attackSpeed}%</span>
                  </div>
                )}
                {totalStats.abilityHaste > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Celeridad</span>
                    <span className="text-sm font-mono text-green-400">+{totalStats.abilityHaste}</span>
                  </div>
                )}
                {totalStats.armor > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Armadura</span>
                    <span className="text-sm font-mono text-green-400">+{totalStats.armor}</span>
                  </div>
                )}
                {totalStats.magicResist > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Resistencia Mágica</span>
                    <span className="text-sm font-mono text-green-400">+{totalStats.magicResist}</span>
                  </div>
                )}
                {totalStats.health > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Vida</span>
                    <span className="text-sm font-mono text-green-400">+{totalStats.health}</span>
                  </div>
                )}
                {Object.values(totalStats).every(v => v === 0) && (
                  <p className="text-xs text-gray-500 italic">Selecciona runas para ver estadísticas</p>
                )}
              </div>
            </div>

            {/* Synergy Tip */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Sugerencia
              </h4>
              <p className="text-xs text-gray-500 italic">
                {keystone === 8010 ? "Grasp es excelente para campeones tanks con trades frecuentes." :
                 keystone === 8008 ? "Lethal Tempo maximiza DPS en peleas largas." :
                 keystone === 8021 ? "Phasing es ideal para campeones que necesitan movilidad." :
                 "Selecciona tu Keystone para ver sugerencias de sinergia."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
