// ChampionGrid - Displays searchable grid of champion cards
import { useState, useEffect } from 'react';
import type { ChampionSummary, ChampionRole } from '../../types/dataDragon';
import { ROLE_TRANSLATIONS, ALL_ROLES } from '../../types/dataDragon';
import { 
  getChampions, 
  searchChampions,
  getChampionSquareUrl
} from '../../services/dataDragonService';

// Archetype icons
import allIcon from '../../assets/icons/archetypes/all.png';
import fighterIcon from '../../assets/icons/archetypes/fighter.png';
import tankIcon from '../../assets/icons/archetypes/tank.png';
import mageIcon from '../../assets/icons/archetypes/mage.png';
import assassinIcon from '../../assets/icons/archetypes/assassin.png';
import marksmanIcon from '../../assets/icons/archetypes/marksman.png';
import supportIcon from '../../assets/icons/archetypes/support.png';

const ROLE_ICONS: Record<ChampionRole | 'all', string> = {
  all: allIcon,
  Fighter: fighterIcon,
  Tank: tankIcon,
  Mage: mageIcon,
  Assassin: assassinIcon,
  Marksman: marksmanIcon,
  Support: supportIcon,
};

interface ChampionGridProps {
  onSelect: (champion: ChampionSummary) => void;
  selectedId?: string;
}

export default function ChampionGrid({ onSelect, selectedId }: ChampionGridProps) {
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [filteredChampions, setFilteredChampions] = useState<ChampionSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<ChampionRole | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load champions on mount
  useEffect(() => {
    async function loadChampions() {
      try {
        setLoading(true);
        const data = await getChampions();
        setChampions(data);
        setFilteredChampions(data);
      } catch (err) {
        setError('Error cargando campeones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChampions();
  }, []);

  // Filter when search or role changes
  useEffect(() => {
    async function filterChampions() {
      let results = champions;
      
      // Apply search filter
      if (searchQuery.trim()) {
        results = await searchChampions(searchQuery);
      }
      
      // Apply role filter
      if (selectedRole !== 'all') {
        results = results.filter(champ => champ.tags.includes(selectedRole));
      }
      
      setFilteredChampions(results);
    }
    
    if (champions.length > 0) {
      filterChampions();
    }
  }, [searchQuery, selectedRole, champions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hextech-gold mx-auto mb-4" />
          <p className="text-gray-400">Cargando campeones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar campeón..."
            className="w-full px-4 py-2 bg-hextech-blue/30 border border-hextech-gold/30 rounded-lg
              text-white placeholder-gray-500 focus:outline-none focus:border-hextech-gold
              transition-colors"
          />
        </div>
        
        {/* Role Filter - Icons with Tooltips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole('all')}
            title="Todos"
            className={`group relative p-2 rounded-lg transition-all
              ${selectedRole === 'all'
                ? 'bg-hextech-gold'
                : 'bg-hextech-blue/30 hover:bg-hextech-blue/50'
              }`}
          >
            <img 
              src={ROLE_ICONS['all']} 
              alt="Todos" 
              className={`w-6 h-6 object-contain transition-all
                ${selectedRole === 'all' ? 'brightness-0' : 'opacity-60 group-hover:opacity-100'}`}
            />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-hextech-black/90 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Todos
            </span>
          </button>
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              title={ROLE_TRANSLATIONS[role]}
              className={`group relative p-2 rounded-lg transition-all
                ${selectedRole === role
                  ? 'bg-hextech-gold'
                  : 'bg-hextech-blue/30 hover:bg-hextech-blue/50'
                }`}
            >
              <img 
                src={ROLE_ICONS[role]} 
                alt={ROLE_TRANSLATIONS[role]} 
                className={`w-6 h-6 object-contain transition-all
                  ${selectedRole === role ? 'brightness-0' : 'opacity-60 group-hover:opacity-100'}`}
              />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-hextech-black/90 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {ROLE_TRANSLATIONS[role]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-500 text-sm">
        {filteredChampions.length} campeones
      </p>

      {/* Champion Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {filteredChampions.map((champion) => (
          <button
            key={champion.id}
            onClick={() => onSelect(champion)}
            className={`
              relative group aspect-square rounded-lg overflow-hidden
              border-2 transition-all duration-200
              ${selectedId === champion.id
                ? 'border-hextech-gold shadow-lg shadow-hextech-gold/30 scale-105'
                : 'border-transparent hover:border-hextech-gold/50 hover:scale-105'
              }
            `}
            title={champion.name}
          >
            <img
              src={getChampionSquareUrl(champion.id)}
              alt={champion.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay with name */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 
              transition-opacity flex items-center justify-center p-1">
              <span className="text-xs text-white text-center leading-tight font-medium">
                {champion.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredChampions.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No se encontraron campeones
        </p>
      )}
    </div>
  );
}
