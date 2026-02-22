import { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { CHAMPION_DATA } from '../../utils/teamAnalysis';

// Import Role Icons (reuse from ChampionBuild or similar)
// For now using text/lucide icons or we can import the assets if paths are known
// Assuming we can get images from ddragon

interface ChampionSelectorProps {
  selectedChampion: string;
  onSelect: (champion: string) => void;
  roleFilter?: string; // Optional default filter
  placeholder?: string;
}

// Removed unused ROLES constant

export function ChampionSelector({ selectedChampion, onSelect, roleFilter: _roleFilter = 'All', placeholder = 'Seleccionar' }: ChampionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const champions = useMemo(() => Object.keys(CHAMPION_DATA), []); // Derive keys

  const filteredChampions = champions.filter(champ => {
    return champ.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Helper to get image
  const getChampImg = (name: string) => 
    `https://ddragon.leagueoflegends.com/cdn/16.3.1/img/champion/${CHAMPION_DATA[name]?.id || name.charAt(0).toUpperCase() + name.slice(1)}.png`;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-gray-800 border ${selectedChampion ? 'border-hextech-gold/50 text-white' : 'border-gray-600 text-gray-400'} rounded hover:border-hextech-gold transition-colors`}
      >
        <div className="flex items-center gap-2">
            {selectedChampion ? (
                <>
                    <img src={getChampImg(selectedChampion)} className="w-6 h-6 rounded-full border border-hextech-gold/30" />
                    <span className="capitalize font-medium">{selectedChampion}</span>
                </>
            ) : (
                <span>{placeholder}</span>
            )}
        </div>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </button>

      {/* Dropdown / Modal */}
      {isOpen && (
        <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
            <div className="absolute z-50 w-64 mt-1 bg-gray-900 border border-hextech-gold/30 rounded-lg shadow-xl flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-100">
                {/* Search Header */}
                <div className="p-2 border-b border-white/10 sticky top-0 bg-gray-900 z-10 rounded-t-lg">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-gray-700 rounded pl-7 pr-2 py-1.5 text-xs text-white focus:border-hextech-gold/50 focus:outline-none"
                            placeholder="Buscar campeón..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-1 scrollbar-hextech">
                    {filteredChampions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-0.5">
                            {filteredChampions.map(champ => (
                                <button
                                    key={champ}
                                    onClick={() => {
                                        onSelect(champ);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors ${selectedChampion === champ ? 'bg-hextech-gold/10' : ''}`}
                                >
                                    <img src={getChampImg(champ)} className="w-8 h-8 rounded border border-gray-700" loading="lazy" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-200 capitalize">{champ}</span>
                                        <span className="text-[10px] text-gray-500">{CHAMPION_DATA[champ].role.join(', ')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-xs text-gray-500">
                            No se encontraron campeones
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
}
