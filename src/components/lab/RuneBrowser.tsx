import { useState, useEffect } from 'react';
import { Search, ChevronRight, Info } from 'lucide-react';
import type { RuneTree, Rune } from '../../services/dataDragon/runeService';
import { getRuneTrees, getRuneIconUrl, RUNE_TREE_COLORS, cleanDescription } from '../../services/dataDragon/runeService';

export default function RuneBrowser() {
  const [runeTrees, setRuneTrees] = useState<RuneTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTree, setSelectedTree] = useState<RuneTree | null>(null);
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadRunes() {
      try {
        const trees = await getRuneTrees();
        setRuneTrees(trees);
        if (trees.length > 0) {
          setSelectedTree(trees[0]);
        }
      } catch (error) {
        console.error('Failed to load runes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRunes();
  }, []);

  // Filter runes by search
  const filteredRunes = selectedTree?.slots.flatMap(slot => 
    slot.runes.filter(rune => 
      rune.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cleanDescription(rune.shortDesc).toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando runas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar runas..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
        />
      </div>

      {/* Rune Trees */}
      <div className="flex flex-wrap justify-center gap-3">
        {runeTrees.map(tree => (
          <button
            key={tree.id}
            onClick={() => { setSelectedTree(tree); setSelectedRune(null); setSearchQuery(''); }}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              selectedTree?.id === tree.id
                ? 'bg-gray-800/80 scale-105'
                : 'bg-gray-800/40 hover:bg-gray-800/60 border-transparent'
            }`}
            style={{
              borderColor: selectedTree?.id === tree.id ? RUNE_TREE_COLORS[tree.key] : 'transparent'
            }}
          >
            <img
              src={getRuneIconUrl(tree.icon)}
              alt={tree.name}
              className="w-10 h-10"
              style={{ filter: `drop-shadow(0 0 6px ${RUNE_TREE_COLORS[tree.key]})` }}
            />
            <span 
              className="text-xs font-medium"
              style={{ color: RUNE_TREE_COLORS[tree.key] }}
            >
              {tree.name}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Rune Selection */}
        <div className="lg:w-2/3 space-y-4">
          {selectedTree && !searchQuery && (
            <>
              {/* Tree Title */}
              <div 
                className="text-center py-2"
                style={{ borderBottomColor: RUNE_TREE_COLORS[selectedTree.key] + '50' }}
              >
                <h3 
                  className="text-xl font-bold"
                  style={{ color: RUNE_TREE_COLORS[selectedTree.key] }}
                >
                  {selectedTree.name}
                </h3>
              </div>

              {/* Rune Slots */}
              {selectedTree.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="uppercase tracking-wider">
                      {slotIndex === 0 ? 'Keystone' : `Fila ${slotIndex}`}
                    </span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    {slot.runes.map(rune => (
                      <button
                        key={rune.id}
                        onClick={() => setSelectedRune(rune)}
                        className={`relative group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                          selectedRune?.id === rune.id
                            ? 'bg-gray-700/80 ring-2 ring-current'
                            : 'bg-gray-800/40 hover:bg-gray-700/60'
                        }`}
                        style={{
                          color: selectedRune?.id === rune.id ? RUNE_TREE_COLORS[selectedTree.key] : undefined
                        }}
                      >
                        <div className={`relative ${slotIndex === 0 ? 'w-14 h-14' : 'w-10 h-10'}`}>
                          <img
                            src={getRuneIconUrl(rune.icon)}
                            alt={rune.name}
                            className="w-full h-full"
                          />
                        </div>
                        <span className="text-xs text-gray-300 text-center max-w-[70px] truncate">
                          {rune.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                {filteredRunes.length} runa{filteredRunes.length !== 1 ? 's' : ''} encontrada{filteredRunes.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {filteredRunes.map(rune => (
                  <button
                    key={rune.id}
                    onClick={() => setSelectedRune(rune)}
                    className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                      selectedRune?.id === rune.id
                        ? 'bg-gray-700/80 ring-2 ring-yellow-500'
                        : 'bg-gray-800/40 hover:bg-gray-700/60'
                    }`}
                  >
                    <img
                      src={getRuneIconUrl(rune.icon)}
                      alt={rune.name}
                      className="w-8 h-8"
                    />
                    <span className="text-xs text-gray-300 truncate">{rune.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Rune Detail (Sticky) */}
        <div className="lg:w-1/3">
          <div className="sticky top-24 space-y-4">
            {selectedRune ? (
              <div 
                className="p-5 rounded-xl border-2 bg-gray-800/60"
                style={{ borderColor: selectedTree ? RUNE_TREE_COLORS[selectedTree.key] + '80' : '#333' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getRuneIconUrl(selectedRune.icon)}
                    alt={selectedRune.name}
                    className="w-14 h-14 shrink-0"
                  />
                  <div>
                    <h4 
                      className="text-lg font-bold"
                      style={{ color: selectedTree ? RUNE_TREE_COLORS[selectedTree.key] : '#ffd700' }}
                    >
                      {selectedRune.name}
                    </h4>
                    {selectedTree && (
                      <span className="text-xs text-gray-500">{selectedTree.name}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {cleanDescription(selectedRune.longDesc || selectedRune.shortDesc)}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-gray-700 bg-gray-800/40 text-center">
                <Info className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Selecciona una runa para ver su descripción
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-blue-300 text-xs">
                  <strong>Nota:</strong> Las runas varían según matchup y parche. 
                  Consulta <a href="https://u.gg" target="_blank" rel="noopener" className="underline hover:text-blue-200">u.gg</a> o <a href="https://op.gg" target="_blank" rel="noopener" className="underline hover:text-blue-200">op.gg</a> para builds actualizados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
