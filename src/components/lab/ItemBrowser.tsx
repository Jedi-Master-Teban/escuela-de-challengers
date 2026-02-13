import { useState, useEffect, useMemo } from 'react';
import { Search, Info } from 'lucide-react';
import type { Item, ShopCategory } from '../../services/dataDragon/itemService';
import { getSummonersRiftItems, categorizeItemsByShop, getItemById, getItemImageUrl, STAT_LABELS, getItemTier } from '../../services/dataDragon/itemService';

import attackDamageIcon from '../../assets/icons/items/attack_damage.png';
import abilityPowerIcon from '../../assets/icons/items/ability_power.png';
import attackSpeedIcon from '../../assets/icons/items/attack_speed.png';
import criticalIcon from '../../assets/icons/items/critical.png';
import healthIcon from '../../assets/icons/items/health.png';
import armorIcon from '../../assets/icons/items/armor.png';
import magicResistIcon from '../../assets/icons/items/magic_resist.png';
import lifestealIcon from '../../assets/icons/items/lifesteal.png';
import manaIcon from '../../assets/icons/items/mana.png';
import bootsIcon from '../../assets/icons/items/boots.png';
import starterIcon from '../../assets/icons/items/starter.png';

// Sidebar category config with PNG icons
const SIDEBAR_CATEGORIES: { key: ShopCategory; icon: string; label: string }[] = [
  { key: 'Daño de Ataque', icon: attackDamageIcon, label: 'AD' },
  { key: 'Poder de Habilidad', icon: abilityPowerIcon, label: 'AP' },
  { key: 'Velocidad de Ataque', icon: attackSpeedIcon, label: 'AS' },
  { key: 'Crítico', icon: criticalIcon, label: 'Crit' },
  { key: 'Vida', icon: healthIcon, label: 'Vida' },
  { key: 'Armadura', icon: armorIcon, label: 'Arm' },
  { key: 'Resistencia Mágica', icon: magicResistIcon, label: 'RM' },
  { key: 'Robo de Vida', icon: lifestealIcon, label: 'Vamp' },
  { key: 'Maná y Regeneración', icon: manaIcon, label: 'Maná' },
  { key: 'Botas', icon: bootsIcon, label: 'Botas' },
  { key: 'Iniciales', icon: starterIcon, label: 'Start' },
];

export default function ItemBrowser() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('Daño de Ataque');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [recipeItems, setRecipeItems] = useState<Item[]>([]);
  const [buildsInto, setBuildsInto] = useState<Item[]>([]);
  const [tierFilter, setTierFilter] = useState<'all' | 'Legendario' | 'Épico' | 'Básico'>('all');

  useEffect(() => {
    async function loadItems() {
      try {
        const allItems = await getSummonersRiftItems();
        const filteredItems = allItems.filter(item => item.gold.total > 0);
        setItems(filteredItems);
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  useEffect(() => {
    async function loadRecipe() {
      if (!selectedItem) {
        setRecipeItems([]);
        setBuildsInto([]);
        return;
      }

      if (selectedItem.from && selectedItem.from.length > 0) {
        const components = await Promise.all(selectedItem.from.map(id => getItemById(id)));
        setRecipeItems(components.filter((i): i is Item => i !== null));
      } else {
        setRecipeItems([]);
      }

      if (selectedItem.into && selectedItem.into.length > 0) {
        const builds = await Promise.all(selectedItem.into.map(id => getItemById(id)));
        setBuildsInto(builds.filter((i): i is Item => i !== null));
      } else {
        setBuildsInto([]);
      }
    }
    loadRecipe();
  }, [selectedItem]);

  const categorizedItems = useMemo(() => {
    let filtered = items;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.plaintext?.toLowerCase().includes(query)
      );
    }
    return categorizeItemsByShop(filtered);
  }, [items, searchQuery]);

  const currentItems = useMemo(() => {
    let items = categorizedItems[activeCategory] || [];
    
    // Apply tier filter
    if (tierFilter !== 'all') {
      items = items.filter(item => getItemTier(item) === tierFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.plaintext?.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [categorizedItems, activeCategory, tierFilter, searchQuery]);

  const getFormattedStats = (item: Item) => {
    if (!item.stats) return [];
    return Object.entries(item.stats)
      .filter(([_, value]) => value !== 0)
      .map(([stat, value]) => ({
        label: STAT_LABELS[stat] || stat,
        value: stat.includes('Percent') ? `${(value * 100).toFixed(0)}%` : `+${value}`
      }));
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'Legendario': return 'border-orange-500 shadow-orange-500/30';
      case 'Épico': return 'border-purple-500 shadow-purple-500/30';
      default: return 'border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] rounded-xl border border-[#785a28]/50 overflow-hidden">
      {/* Header with search and gold */}
      <div className="flex items-center gap-4 p-3 bg-[#1a1a2e] border-b border-[#785a28]/30">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8aa6e]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar items..."
            className="w-full pl-9 pr-4 py-2 bg-[#0a0a0f] border border-[#785a28]/30 rounded text-sm text-white placeholder-[#c8aa6e]/30 focus:border-[#c8aa6e]/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'Legendario', 'Épico', 'Básico'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-2 py-1 text-xs rounded border transition-all ${
                tierFilter === tier
                  ? tier === 'Legendario' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                  : tier === 'Épico' ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : tier === 'Básico' ? 'bg-gray-500/20 border-gray-500 text-gray-400'
                  : 'bg-[#c8aa6e]/20 border-[#c8aa6e] text-[#c8aa6e]'
                  : 'bg-[#0a0a0f] border-[#785a28]/30 text-gray-500 hover:border-[#785a28]'
              }`}
            >
              {tier === 'all' ? 'Todos' : tier}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Categories */}
        <div className="w-16 bg-[#0f0f1a] border-r border-[#785a28]/20 py-2 overflow-y-auto scrollbar-hextech">
          {SIDEBAR_CATEGORIES.map(cat => {
            const count = categorizedItems[cat.key]?.length || 0;
            const isActive = activeCategory === cat.key;
            
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full flex flex-col items-center py-2 px-1 transition-all relative ${
                  isActive 
                    ? 'bg-[#1a1a2e]' 
                    : 'hover:bg-[#1a1a2e]/50'
                }`}
                title={`${cat.key} (${count})`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#c8aa6e] rounded-r" />
                )}
                <img 
                  src={cat.icon} 
                  alt={cat.label}
                  className={`w-6 h-6 object-contain ${isActive ? 'brightness-125' : 'opacity-70 group-hover:opacity-100'}`}
                />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'text-[#c8aa6e]' : 'text-gray-500'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center - Items Grid */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hextech bg-[#0f0f1a]">
          <div className="flex items-center gap-2 mb-3">
            <img 
              src={SIDEBAR_CATEGORIES.find(c => c.key === activeCategory)?.icon} 
              alt={activeCategory}
              className="w-8 h-8 object-contain"
            />
            <h3 className="text-[#c8aa6e] font-medium">{activeCategory}</h3>
            <span className="text-gray-500 text-sm">({currentItems.length})</span>
          </div>
          
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-1">
            {currentItems
              .sort((a, b) => (a.gold?.total || 0) - (b.gold?.total || 0))
              .map(item => {
                const isSelected = selectedItem?.id === item.id;
                const tier = getItemTier(item);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`relative group aspect-square rounded transition-all ${
                      isSelected 
                        ? 'ring-2 ring-[#c8aa6e] scale-110 z-10' 
                        : `hover:scale-105 border-2 ${getTierStyle(tier)}`
                    }`}
                    title={item.name}
                  >
                    <img
                      src={getItemImageUrl(item.image.full)}
                      alt={item.name}
                      className="w-full h-full rounded"
                      loading="lazy"
                    />
                    {/* Gold price overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[#c8aa6e] text-[9px] font-medium text-center py-0.5 rounded-b">
                      {item.gold.total}
                    </div>
                  </button>
                );
              })}
          </div>

          {currentItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron items
            </div>
          )}
        </div>

        {/* Right Panel - Item Details */}
        <div className="w-72 bg-[#0f0f1a] border-l border-[#785a28]/20 p-4">
          {selectedItem ? (
            <div className="space-y-4">
              {/* Item Header */}
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded border-2 ${getTierStyle(getItemTier(selectedItem))}`}>
                  <img
                    src={getItemImageUrl(selectedItem.image.full)}
                    alt={selectedItem.name}
                    className="w-12 h-12"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#c8aa6e] font-bold text-sm truncate">{selectedItem.name}</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[#c8aa6e]">🪙</span>
                    <span className="text-[#c8aa6e] font-medium text-sm">{selectedItem.gold.total}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedItem.plaintext && (
                <p className="text-gray-400 text-xs leading-relaxed">{selectedItem.plaintext}</p>
              )}

              {/* Stats */}
              {getFormattedStats(selectedItem).length > 0 && (
                <div className="space-y-1 p-2 bg-[#1a1a2e] rounded border border-[#785a28]/20">
                  {getFormattedStats(selectedItem).map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-[#0ac8b9] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recipe Tree */}
              {recipeItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Receta</span>
                  <div className="flex items-center justify-center gap-1 p-3 bg-[#1a1a2e] rounded border border-[#785a28]/20">
                    {/* Components */}
                    <div className="flex gap-1">
                      {recipeItems.map(comp => (
                        <button
                          key={comp.id}
                          onClick={() => setSelectedItem(comp)}
                          className="relative group"
                          title={`${comp.name} - ${comp.gold.total}g`}
                        >
                          <img
                            src={getItemImageUrl(comp.image.full)}
                            alt={comp.name}
                            className="w-8 h-8 rounded border border-gray-600 hover:border-[#c8aa6e] transition-colors"
                          />
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-[#c8aa6e] bg-black/80 px-1 rounded">
                            {comp.gold.total}
                          </span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Arrow */}
                    <div className="text-[#785a28] text-lg px-2">→</div>
                    
                    {/* Result */}
                    <div className="relative">
                      <img
                        src={getItemImageUrl(selectedItem.image.full)}
                        alt={selectedItem.name}
                        className="w-10 h-10 rounded border-2 border-[#c8aa6e]"
                      />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-[#c8aa6e] bg-black/80 px-1 rounded">
                        +{selectedItem.gold.base}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Builds Into */}
              {buildsInto.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Se usa para</span>
                  <div className="flex flex-wrap gap-1">
                    {buildsInto.slice(0, 6).map(upgrade => (
                      <button
                        key={upgrade.id}
                        onClick={() => setSelectedItem(upgrade)}
                        className="relative group"
                        title={upgrade.name}
                      >
                        <img
                          src={getItemImageUrl(upgrade.image.full)}
                          alt={upgrade.name}
                          className="w-8 h-8 rounded border border-gray-600 hover:border-[#c8aa6e] transition-colors"
                        />
                      </button>
                    ))}
                    {buildsInto.length > 6 && (
                      <span className="text-xs text-gray-500 self-center">+{buildsInto.length - 6}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <Info className="w-8 h-8 text-[#785a28] mb-2" />
              <p className="text-gray-500 text-sm">Selecciona un item</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
