import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sword, Shield, Sparkles, Info, Loader2, Target } from 'lucide-react';
import { getItemImageUrl, STAT_LABELS } from '../../services/dataDragon/itemService';
import type { Item } from '../../services/dataDragon/itemService';
import { getRuneIconUrl, RUNE_TREE_COLORS, STAT_SHARDS } from '../../services/dataDragon/runeService';
import { getItemById } from '../../services/dataDragon/itemService';
import { getRuneTreeById, getRuneById, getRuneTree } from '../../services/dataDragon/runeService';
import type { RuneTree, Rune } from '../../services/dataDragon/runeService';
import { getRoleForChampion, getRoleBasedItems, getRoleBasedRunes } from '../../services/dataDragon/roleItemService';
import { HextechToast } from '../hextech';
import type { ToastType } from '../hextech/HextechToast';
// Import Role Icons
import TopIcon from '../../assets/icons/roles/Top_icon.png';
import JungleIcon from '../../assets/icons/roles/Jungle_icon.png';
import MidIcon from '../../assets/icons/roles/Middle_icon.png';
import AdcIcon from '../../assets/icons/roles/Bottom_icon.png';
import SuppIcon from '../../assets/icons/roles/Support_icon.png';

const ROLE_ICONS: Record<string, string> = {
    'top': TopIcon,
    'jungle': JungleIcon,
    'mid': MidIcon,
    'adc': AdcIcon,
    'support': SuppIcon
};

interface BuildData {
  role: string;
  description: string;
  items: {
    core: string[];
    situational: string[];
    boots: string[];
  };
  runes: {
    primary: { tree: number; keystone: number; runes: number[] };
    secondary: { tree: number; runes: number[] };
  };
  tips: string[];
}

interface ChampionBuildProps {
  championName?: string;
  buildData?: BuildData;
}

export default function ChampionBuild({ championName, buildData }: ChampionBuildProps) {
  // Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(buildData?.role || 'Mid');
  const [importLoading, setImportLoading] = useState(false);
  const [winrate, setWinrate] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: ToastType }>({ 
    show: false, 
    msg: '', 
    type: 'info' 
  });

  // Data State
  const [fetchedBuildData, setFetchedBuildData] = useState<BuildData | null>(null);
  
  // Derived Data (Prop takes precedence, then fetched)
  // Derived Data (Fetched takes precedence if it matches selected role interaction)
  // Logic: If user clicked a role, fetching updates 'fetchedBuildData'. 
  // If 'fetchedBuildData' exists and matches role, use it. Else fall back to props.
  const activeData = (fetchedBuildData && fetchedBuildData.role.toLowerCase() === selectedRole.toLowerCase()) 
      ? fetchedBuildData 
      : buildData;

  const [coreItems, setCoreItems] = useState<Item[]>([]);
  const [boots, setBoots] = useState<Item[]>([]);
  
  // Rune State
  const [primaryTree, setPrimaryTree] = useState<RuneTree | null>(null);
  const [secondaryTree, setSecondaryTree] = useState<RuneTree | null>(null);
  const [keystone, setKeystone] = useState<Rune | null>(null);
  
  // Resolved Runes for Display
  const [resolvedPrimaryRunes, setResolvedPrimaryRunes] = useState<Rune[]>([]);
  const [resolvedSecondaryRunes, setResolvedSecondaryRunes] = useState<Rune[]>([]);
  const [resolvedShards, setResolvedShards] = useState<{id: number, icon: string}[]>([]);

  // Loading & Tooltip
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    async function loadBuildData() {
      // If we already have data for this role (via props or previous fetch), don't re-fetch unless force needed.
      // But we need to ensure activeData matches selectedRole.
      if (activeData && activeData.role.toLowerCase() === selectedRole.toLowerCase()) {
         // Data is fresh for this role.
         setLoading(false);
         return;
      }

      setLoading(true);
      try {
        let currentBuildData = activeData;
        let fetchedRunes: number[] = [];
        let fetchedShards: number[] = [];

        // If no data OR data is for wrong role, FETCH it
        if ((!currentBuildData || currentBuildData.role.toLowerCase() !== selectedRole.toLowerCase()) && championName) {
            try {
                const res = await axios.get(
                    `http://localhost:3001/api/scrape-builds/${championName}/${selectedRole.toLowerCase()}`, 
                    { signal: controller.signal }
                );
                
                if (res.data && res.data.items) {
                    const { items, runes = [], winrate } = res.data;
                    setWinrate(winrate);
                    
                    // Adapt to internal structure
                    fetchedRunes = runes.filter((id: number) => id < 5000);
                    fetchedShards = runes.filter((id: number) => id >= 5000);
                    
                    const newData: BuildData = {
                        role: selectedRole,
                        description: `Build recomendada (${winrate})`,
                        items: {
                          core: items.core ? items.core.map(String) : [],
                          boots: items.boots ? items.boots.map(String) : [],
                          situational: items.situational ? items.situational.map(String) : []
                        },
                        runes: {
                            primary: { tree: 0, keystone: 0, runes: [] }, 
                            secondary: { tree: 0, runes: [] }
                        },
                        tips: []
                    };
                    setFetchedBuildData(newData);
                    currentBuildData = newData;
                } else {
                     throw new Error("Invalid build data received");
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
                console.error("Failed to scrape build:", err);
                
                // Fallback 1: If we have static data, use it
                if (buildData) {
                    console.log("Using static build data as fallback");
                    setFetchedBuildData(buildData);
                    currentBuildData = buildData;
                } else {
                    // Fallback 2: Generate role-based recommendations
                    console.log("Generating role-based recommendations as fallback");
                    const roleKey = getRoleForChampion(championName || '');
                    const roleRunes = getRoleBasedRunes(roleKey);
                    
                    const roleBasedData: BuildData = {
                        role: selectedRole,
                        description: `Build recomendada por rol (${roleKey}) - Datos generados automáticamente`,
                        items: { core: [], boots: [], situational: [] },
                        runes: roleRunes,
                        tips: [
                            `Esta build se basa en recomendaciones generales para el rol ${selectedRole}`,
                            'Los items pueden variar según la composición enemiga',
                            'Ajusta los items situacionales según sea necesario'
                        ]
                    };
                    setFetchedBuildData(roleBasedData);
                    currentBuildData = roleBasedData;
                    
                    // Load role-based items asynchronously
                    loadRoleBasedItems(roleKey);
                }
            }
        }

        if (!currentBuildData) {
            setLoading(false);
            return; 
        };

        // Load items
        const corePromises = currentBuildData.items.core.map(id => getItemById(id));
        const bootPromises = currentBuildData.items.boots.map(id => getItemById(id));

        const [core, boot] = await Promise.all([
          Promise.all(corePromises),
          Promise.all(bootPromises)
        ]);

        setCoreItems(core.filter((i): i is Item => i !== null));
        setBoots(boot.filter((i): i is Item => i !== null));

        // Load Runes
        if (fetchedRunes.length > 0) {
            // Dynamic resolution from simple IDs
            const trees = new Set<number>();
            const resolvedRunes: Rune[] = [];
            
            for (const id of fetchedRunes) {
                const r = await getRuneById(id);
                if (r) {
                    resolvedRunes.push(r);
                    const t = await getRuneTree(id);
                    if (t) trees.add(t.id);
                }
            }

            // Simple heuristic: Tree with Keystone (first row) is Primary
            // Or just Tree with most runes (4 vs 2)
            // Ideally we check if a rune is a keystone
            
            // Group runes by tree
            const treeGroups: Record<number, Rune[]> = {};
            for (const r of resolvedRunes) {
                const t = await getRuneTree(r.id);
                if (t) {
                    if (!treeGroups[t.id]) treeGroups[t.id] = [];
                    treeGroups[t.id].push(r);
                }
            }

            const sortedTrees = Object.entries(treeGroups).sort((a, b) => b[1].length - a[1].length);
            if (sortedTrees.length > 0) {
                const pTreeId = parseInt(sortedTrees[0][0]);
                const sTreeId = sortedTrees.length > 1 ? parseInt(sortedTrees[1][0]) : 0;

                const pTree = await getRuneTreeById(pTreeId);
                const sTree = await getRuneTreeById(sTreeId);

                setPrimaryTree(pTree);
                setSecondaryTree(sTree);
                setResolvedPrimaryRunes(treeGroups[pTreeId] || []);
                setResolvedSecondaryRunes(treeGroups[sTreeId] || []);
                
                // Identify Keystone: Usually the first rune in the primary list (if ordered), or check slots
                // For now, take the first one or logic from 'slots[0]'
                 if (pTree) {
                    const keystones = pTree.slots[0].runes.map(r => r.id);
                    const foundKeystone = treeGroups[pTreeId].find(r => keystones.includes(r.id));
                    setKeystone(foundKeystone || null);
                }
            }

             // Shards
            const shards = STAT_SHARDS.filter(s => fetchedShards.includes(s.id));
            setResolvedShards(shards);

        } else {
            // Static JSON resolution
            const [primary, secondary, ks] = await Promise.all([
              getRuneTreeById(currentBuildData.runes.primary.tree),
              getRuneTreeById(currentBuildData.runes.secondary.tree),
              getRuneById(currentBuildData.runes.primary.keystone)
            ]);

            setPrimaryTree(primary);
            setSecondaryTree(secondary);
            setKeystone(ks);

            // Resolve IDs to Runes
            if (primary) {
                 const pRunes = await Promise.all(currentBuildData.runes.primary.runes.map(id => getRuneById(id)));
                 setResolvedPrimaryRunes(pRunes.filter((r): r is Rune => r !== null));
            }
            if (secondary) {
                 const sRunes = await Promise.all(currentBuildData.runes.secondary.runes.map(id => getRuneById(id)));
                 setResolvedSecondaryRunes(sRunes.filter((r): r is Rune => r !== null));
            }
        }
      } catch (e) {
        console.error('Failed to load build data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadBuildData();
    return () => controller.abort();
  }, [championName, selectedRole]); // Added selectedRole to trigger refresh on role change

  // Mode State Persistence Logic
  useEffect(() => {
    // Sync selectedRole when buildData changes (e.g. champion change)
    if (buildData?.role) {
        setSelectedRole(buildData.role);
    }
  }, [buildData]);

  // Helper to resolve rune objects from IDs
  const resolveRunesForDisplay = async (runeIds: number[], pTreeId?: number) => {
      const pRunes: Rune[] = [];
      const sRunes: Rune[] = [];
      const shards: {id: number, icon: string}[] = [];

      // Fetch all rune details
      for (const id of runeIds) {
          // Check if Shard
          const shard = STAT_SHARDS.find(s => s.id === id);
          if (shard) {
              shards.push({ id: shard.id, icon: shard.icon });
              continue;
          }

          const rune = await getRuneById(id);
          if (!rune) continue;

          // Determine tree by checking if rune exists in data
          // (Requires fetching tree, but getRuneById handles it internally usually, 
          //  but we need to know WHICH tree this rune belongs to efficiently)
          // Simplified: We check if it matches the assigned Primary/Secondary trees
          // In a real app we might traverse the trees to check ownership.
          
          // Let's rely on the tree structure or just fetch the tree for the rune
           const tree = await import('../../services/dataDragon/runeService').then(m => m.getRuneTree(id));
           
           if (tree) {
               if (pTreeId && tree.id === pTreeId) {
                   pRunes.push(rune);
               } else {
                   sRunes.push(rune);
               }
           }
      }

      // Sort Primary: Keystone is Key. Actually, usually sorted by slot index.
      // Filter out duplicates if any
      setResolvedPrimaryRunes(pRunes);
      setResolvedSecondaryRunes(sRunes);
      setResolvedShards(shards);
  };


   // Load role-based items as fallback
   const loadRoleBasedItems = async (roleKey: string) => {
       try {
           const roleItems = await getRoleBasedItems(roleKey);
           setCoreItems(roleItems.core);
           setBoots(roleItems.boots);
       } catch (error) {
           console.error('Failed to load role-based items:', error);
       }
   };


  // Handler for Auto-Import
  const handleAutoImport = async () => {
      if (!championName) return;
      setImportLoading(true);
      try {
          const response = await fetch(`http://localhost:3001/api/scrape-builds/${championName.toLowerCase()}/${selectedRole.toLowerCase()}`);
          const data = await response.json();
          
          if (data.runeIds && data.runeIds.length > 0) {
              // 1. Update State with new Runes
              const firstId = data.runeIds[0];
              const pTree = await import('../../services/dataDragon/runeService').then(m => m.getRuneTree(firstId));
              // Wait, finding secondary tree from a mixed bag of IDs is tricky.
              // Heuristic: The rune that is NOT in pTree and NOT a shard is secondary.
              let sTree = null;
              if (pTree) {
                  for (const rid of data.runeIds) {
                      if (STAT_SHARDS.some(s => s.id === rid)) continue;
                      const tree = await import('../../services/dataDragon/runeService').then(m => m.getRuneTree(rid));
                      if (tree && tree.id !== pTree.id) {
                          sTree = tree;
                          break;
                      }
                  }
              }
              
              const ks = await getRuneById(firstId);
              
              if (pTree) setPrimaryTree(pTree);
              if (sTree) setSecondaryTree(sTree);
              if (ks) setKeystone(ks);
              
              setWinrate(data.winrate);

              // Resolve display
              await resolveRunesForDisplay(data.runeIds, pTree?.id);

              // 2. Update Items
              if (data.itemIds && data.itemIds.length > 0) {
                 const itemPromises = data.itemIds.map((id: number) => getItemById(id.toString()));
                 const fetchedItems = await Promise.all(itemPromises);
                 const validItems = fetchedItems.filter((i: Item | null): i is Item => i !== null);
                 
                 setCoreItems(validItems);
                 setBoots([]);
              }

               setToast({
                 show: true,
                 msg: `¡Build importada para ${championName} en rol ${selectedRole}!`,
                 type: 'success'
               });
           } else {
               setToast({
                 show: true,
                 msg: 'No se encontró build meta para este rol en U.GG.',
                 type: 'warning'
               });
           }
       } catch (error) {
           console.error('Import failed', error);
           setToast({
             show: true,
             msg: 'Falló la importación. Comprueba tu conexión o que el proxy esté activo.',
             type: 'error'
           });
       } finally {
          setImportLoading(false);
      }
  };

  // Analysis / Resume Calculation
  const getBuildAnalysis = () => {
    if (!keystone) return null;
    const analysisMap: Record<string, { title: string, pros: string, cons: string }> = {
       'Electrocute': { title: 'Burst / Intercambios Cortos', pros: 'Alto daño explosivo para tradeos rápidos.', cons: 'Menos útil en peleas largas o contra tanques.' },
      'Dark Harvest': { title: 'Scaling / Ejecución', pros: 'Escalado infinito en late game.', cons: 'Débil en línea, requiere kills.' },
      'Conqueror': { title: 'Sustain / Batallas Largas', pros: 'Excelente para peleas prolongadas y curación.', cons: 'Tarda en cargarse.' },
      'Lethal Tempo': { title: 'DPS / Attack Speed', pros: 'Supera el límite de velocidad de ataque.', cons: 'Necesita tiempo para stackear.' },
      'Press the Attack': { title: 'Focus / Vulnerabilidad', pros: 'Bueno para single-target focus.', cons: 'No aporta mucho en AOE.' },
      'Fleet Footwork': { title: 'Sustain / Movilidad', pros: 'Curación y velocidad en línea safe.', cons: 'Menor daño directo.' },
      'Grasp of the Undying': { title: 'Tankiness / Sustain', pros: 'Vida extra y curación en cada trade.', cons: 'Requiere estar en combate constante.' },
      'Aftershock': { title: 'Engage / Resistencia', pros: 'Gran resistencia al iniciar.', cons: 'Tiene cooldown largo.' },
      'Guardian': { title: 'Protección / Peel', pros: 'Salva aliados con escudo.', cons: 'Cooldown muy largo.' },
      'Phase Rush': { title: 'Movilidad / Kiting', pros: 'Resistencia a slows y escape.', cons: 'Sin daño extra.' },
      'Arcane Comet': { title: 'Poke / Disengage', pros: 'Daño extra en habilidades de rango.', cons: 'Puede fallar si el enemigo tiene dash.' },
      'Summon Aery': { title: 'Poke / Utilidad', pros: 'Daño y escudo constante.', cons: 'Bajo impacto en burst.' },
      'First Strike': { title: 'Economía / Burst', pros: 'Oro extra y daño verdadero.', cons: 'Se desactiva si te pegan primero.' },
      'Unsealed Spellbook': { title: 'Utilidad / Versatilidad', pros: 'Acceso a múltiples hechizos.', cons: 'Sin runa de combate directa.' },
      'Glacial Augment': { title: 'Control / Slow', pros: 'Reduce daño y ralentiza en área.', cons: 'Requiere CC duro para activar.' },
    };
    return analysisMap[keystone.name] || { title: 'Balanceado', pros: 'Build estándar.', cons: 'Sin especialización clara.' };
  };

  const analysis = getBuildAnalysis();
  
  const getItemStats = (item: Item) => {
    if (!item.stats) return null;
    return Object.entries(item.stats)
      .map(([key, val]) => ({
        label: STAT_LABELS[key] || key,
        value: val > 0 ? `+${val}` : val
      }))
      .filter(s => s.label);
  };

  if (loading || !activeData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
        {!activeData && !loading && <span className="ml-3 text-gray-400 text-xs">Cargando datos...</span>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: Role Selector & Edit Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             {/* Read-Only Role Display (Replaced with Selector below) 
                 Actually, let's make this interactive.
             */}
             <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                {Object.keys(ROLE_ICONS).map((roleKey) => (
                    <button
                        key={roleKey}
                        type="button"
                        onClick={() => setSelectedRole(roleKey.charAt(0).toUpperCase() + roleKey.slice(1))}
                        className={`p-1.5 rounded-md transition-all ${
                            selectedRole.toLowerCase() === roleKey 
                                ? 'bg-hextech-gold text-black shadow-lg shadow-hextech-gold/20' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                        title={roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                    >
                        <img 
                            src={ROLE_ICONS[roleKey]} 
                            className={`w-4 h-4 ${selectedRole.toLowerCase() === roleKey ? 'brightness-0' : 'grayscale opacity-60'}`} 
                            alt={roleKey}
                        />
                    </button>
                ))}
             </div>

             {winrate && (
                <span className="text-[10px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20 h-fit">
                    {winrate}
                </span>
             )}
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-md line-clamp-1 italic">
            {activeData.description}
          </p>
        </div>

        <div className="flex gap-2 items-center">
            {isEditMode && (
                 <>
                <button 
                  type="button"
                  className={`flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs font-semibold rounded-md border border-yellow-500/50 transition-colors ${importLoading ? 'opacity-50 cursor-wait' : ''}`}
                  onClick={handleAutoImport}
                  disabled={importLoading}
                >
                    {importLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {importLoading ? 'Importando...' : 'Autoimportar'}
                </button>
                </>
            )}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                isEditMode 
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/50' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-600'
              }`}
            >
              {isEditMode ? 'Listo' : 'Arma tu conjunto'}
            </button>
        </div>
      </div>

      {/* Core Items */}
      <div className="space-y-3">
         <div className="flex items-center gap-2">
          <Sword className="w-4 h-4 text-yellow-500" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Items Core</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {coreItems.length > 0 ? coreItems.map(item => (
            <div key={item.id} className="relative group" onMouseEnter={() => setActiveTooltip(`item-${item.id}`)} onMouseLeave={() => setActiveTooltip(null)}>
              <div className="w-12 h-12 rounded-lg border-2 border-yellow-500/50 overflow-hidden bg-gray-800 hover:border-yellow-400 transition-colors cursor-pointer">
                <img src={getItemImageUrl(item.image.full)} alt={item.name} className="w-full h-full object-cover" />
              </div>
              {/* Enhanced Item Tooltip */}
              {activeTooltip === `item-${item.id}` && (
                 <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-0 bg-hextech-black rounded-lg shadow-2xl border border-hextech-gold/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-hextech-gold/10 p-2 border-b border-hextech-gold/20">
                        <span className="font-bold text-hextech-gold text-xs uppercase tracking-widest block truncate">{item.name}</span>
                    </div>
                    <div className="p-3 space-y-2">
                        <p className="text-[10px] text-gray-400 leading-relaxed italic border-b border-white/5 pb-2">
                            {item.plaintext || 'Un objeto poderoso de la Grieta.'}
                        </p>
                        
                        {/* Stats Display */}
                        <div className="grid grid-cols-1 gap-1">
                            {getItemStats(item)?.map((s, idx) => (
                                <div key={idx} className="flex justify-between text-[10px]">
                                    <span className="text-gray-500 uppercase">{s.label}</span>
                                    <span className="text-hextech-gold font-bold">{s.value}</span>
                                </div>
                            ))}
                        </div>

                        {item.gold && (
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                                <span className="text-gray-500 uppercase">Costo Total</span>
                                <span className="text-yellow-500 font-bold">{item.gold.total}G</span>
                            </div>
                        )}
                    </div>
                 </div>
              )}
            </div>
          )) : <span className="text-gray-500 text-sm italic">No items imported.</span>}
        </div>
      </div>

       {/* Boots */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Botas</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {boots.map(item => (
            <div key={item.id} className="relative group" onMouseEnter={() => setActiveTooltip(`boot-${item.id}`)} onMouseLeave={() => setActiveTooltip(null)}>
              <div className="w-10 h-10 rounded-lg border border-blue-500/50 overflow-hidden bg-gray-800 hover:border-blue-400 transition-colors cursor-pointer">
                <img src={getItemImageUrl(item.image.full)} alt={item.name} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Runes - FULL PAGE DISPLAY */}
      {primaryTree && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Runas</h4>
          <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-900/80 rounded-lg border border-gray-700 relative overflow-hidden">
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <img src={getRuneIconUrl(primaryTree.icon)} className="w-64 h-64 grayscale" />
             </div>

             {/* Primary Tree Column */}
             <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
                    <img src={getRuneIconUrl(primaryTree.icon)} className="w-8 h-8" />
                    <span className="font-bold text-lg" style={{ color: RUNE_TREE_COLORS[primaryTree.key] }}>{primaryTree.name}</span>
                </div>
                
                {/* Keystone */}
                <div className="flex justify-center py-2">
                    {keystone && (
                        <div className="relative group">
                            <img 
                                src={getRuneIconUrl(keystone.icon)} 
                                className="w-16 h-16 rounded-full border-2 border-transparent hover:border-white/50 transition-all cursor-help"
                                style={{ filter: `drop-shadow(0 0 10px ${RUNE_TREE_COLORS[primaryTree.key]}60)` }}
                            />
                             <div className="absolute top-full left-1/2 -translate-x-1/2 text-center text-xs font-semibold mt-1 w-max text-white shadow-black drop-shadow-md">
                                {keystone.name}
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Slots (Runes active in this tree excluding Keystone) */}
                <div className="flex flex-col gap-4 items-center">
                    {resolvedPrimaryRunes.filter(r => r.id !== keystone?.id).map(rune => (
                        <div key={rune.id} className="relative group flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-black/40 border border-gray-700 flex items-center justify-center group-hover:border-yellow-500/50 transition-colors">
                                <img src={getRuneIconUrl(rune.icon)} className="w-8 h-8 opacity-90 group-hover:opacity-100" />
                             </div>
                             {/* Name Tooltip (Static for readability) */}
                             <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{rune.name}</span>
                        </div>
                    ))}
                </div>
             </div>

             {/* Secondary Tree Column */}
             {secondaryTree && (
                 <div className="flex-1 flex flex-col gap-6 border-l border-gray-700/50 pl-8 md:pl-12">
                     <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
                        <img src={getRuneIconUrl(secondaryTree.icon)} className="w-6 h-6 opacity-80" />
                        <span className="font-bold text-md text-gray-300">{secondaryTree.name}</span>
                    </div>

                    {/* Secondary Active Slots */}
                    <div className="flex flex-col gap-3">
                        {resolvedSecondaryRunes.map(rune => (
                             <div key={rune.id} className="flex items-center gap-3 group" onMouseEnter={() => setActiveTooltip(`rune-${rune.id}`)} onMouseLeave={() => setActiveTooltip(null)}>
                                <div className="w-9 h-9 rounded-full bg-black/40 border border-gray-700 flex items-center justify-center group-hover:border-gray-500 transition-colors cursor-help">
                                    <img src={getRuneIconUrl(rune.icon)} className="w-7 h-7" />
                                </div>
                                <span className="text-sm text-gray-400 group-hover:text-gray-300">{rune.name}</span>
                                
                                {/* Rune Tooltip */}
                                {activeTooltip === `rune-${rune.id}` && (
                                    <div className="absolute z-50 bottom-full left-0 mb-3 w-80 p-4 bg-hextech-black rounded-xl shadow-2xl border border-hextech-gold/30 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center gap-3 mb-2 border-b border-white/10 pb-2">
                                            <img src={getRuneIconUrl(rune.icon)} className="w-8 h-8" />
                                            <span className="font-bold text-hextech-gold uppercase tracking-wider">{rune.name}</span>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[11px] text-hextech-gold/90 font-medium bg-hextech-gold/5 p-2 rounded italic">
                                                {rune.shortDesc.replace(/<[^>]*>?/gm, '')}
                                            </p>
                                            <div 
                                                className="text-[10px] text-gray-400 leading-relaxed rune-desc-full"
                                                dangerouslySetInnerHTML={{ __html: rune.longDesc }}
                                            />
                                        </div>
                                    </div>
                                )}
                             </div>
                        ))}
                    </div>

                    {/* Shards (Stat Mods) */}
                    <div className="mt-4 pt-4 border-t border-gray-700/30 flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Stats</span>
                        <div className="flex gap-2">
                            {resolvedShards.map((shard, idx) => (
                                <div key={idx} className="w-8 h-8 rounded bg-black/20 border border-gray-700 flex items-center justify-center">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/img/${shard.icon}`} className="w-5 h-5" />
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* Analysis Panel (Resume) */}
      {analysis && isEditMode && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">Resumen de Build</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <span className="text-xs text-blue-300/70 uppercase">Estilo de Juego</span>
                    <p className="text-blue-100 font-medium">{analysis.title}</p>
                </div>
                <div>
                    <span className="text-xs text-green-400/70 uppercase">Fortalezas</span>
                    <p className="text-gray-300 text-sm">{analysis.pros}</p>
                </div>
                <div className="md:col-span-2">
                    <span className="text-xs text-red-400/70 uppercase">Precaución</span>
                    <p className="text-gray-300 text-sm">{analysis.cons}</p>
                </div>
            </div>
          </div>
      )}

      {/* Tips */}
      {buildData?.tips && buildData.tips.length > 0 && (
        <div className="space-y-3 pb-8">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Tips de Combate</h4>
          </div>
          <ul className="space-y-2">
            {buildData.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <HextechToast 
        isVisible={toast.show}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
