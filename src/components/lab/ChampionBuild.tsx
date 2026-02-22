import { useState, useEffect, useRef } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
  const [situationalItems, setSituationalItems] = useState<Item[]>([]);
  
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
  
  // Track whether user explicitly changed role
  const isUserRoleChange = useRef(false);
  const lastChamp = useRef(championName);

  useEffect(() => {
    const controller = new AbortController();
    
    async function loadBuildData() {
      setLoading(true);
      console.log(`[ChampionBuild] Effect running. Champ: ${championName}, Last: ${lastChamp.current}, UserRoleChange: ${isUserRoleChange.current}, SelectedRole: ${selectedRole}`);

      if (lastChamp.current !== championName) {
         console.log(`[ChampionBuild] Champion changed! Resetting isUserRoleChange.`);
         isUserRoleChange.current = false;
         lastChamp.current = championName;
      }

      try {
        let currentBuildData = activeData;
        let fetchedRunes: number[] = [];
        let fetchedShards: number[] = [];

        if (championName) {
            try {
                // If user changed role explicitly, pass role. Otherwise let U.GG pick default.
                // ALSO avoid generic roles like 'fighter' or 'mage' which are invalid for scraping
                const isGenericRole = ['fighter', 'marksman', 'tank', 'mage', 'assassin', 'support', 'mage_burst', 'mage_battle', 'support_enchanter', 'support_tank', 'jungle_fighter', 'jungle_assassin'].includes(selectedRole.toLowerCase());
                
                // SCRAPING DISABLED: The backend proxy is causing browser reloads/crashes.
                // Using static fallback data until backend is fixed.
                // const scrapeUrl = ...
                
                console.log(`[ChampionBuild] Scraping skipped for stability.`);
                
                // Stub response to trigger fallback logic
                const res = { status: 200, data: null };
                 
                /* 
                // Original fetching logic (Disabled)
                const res = await axios.get(scrapeUrl, { 
                    signal: controller.signal,
                    timeout: 8000 
                });
                */
                console.log("[ChampionBuild] Scrape Response:", res.status, res.data ? 'Data Received' : 'No Data');
                
                if (res.data && res.data.items) {
                    const { items, runes = [], winrate, role: detectedRole } = res.data;
                    setWinrate(winrate);
                    
                    // Use the role detected by the proxy (from U.GG URL)
                    const effectiveRole = detectedRole || selectedRole;
                    // if (!isUserRoleChange.current && detectedRole && detectedRole !== selectedRole) {
                    //   console.log(`[ChampionBuild] Auto-updating role from ${selectedRole} to ${detectedRole}`);
                    //   setSelectedRole(detectedRole);
                    // }
                    
                    // Runes > 8000, Shards ~5000. Filter shards by known IDs.
                    const shardIds = STAT_SHARDS.map(s => s.id);
                    fetchedShards = runes.filter((id: number) => shardIds.includes(id));
                    fetchedRunes = runes.filter((id: number) => !shardIds.includes(id));
                    
                    console.log("[ChampionBuild] Fetched Runes:", fetchedRunes);
                    console.log("[ChampionBuild] Fetched Shards:", fetchedShards);
                    
                    const newData: BuildData = {
                        role: effectiveRole,
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
                
                // Fallback logic REMOVED: User must click "Auto-Import" to try again.
                // We do NOT want generic data automatically.
                console.log("[ChampionBuild] Fallback skipped. Waiting for user import.");
            }
        }

        // Reset the user role change flag after processing
        isUserRoleChange.current = false;

        if (!currentBuildData) {
            setLoading(false);
            return; 
        };

        // Load items
        const corePromises = currentBuildData.items.core.map(id => getItemById(id));
        const bootPromises = currentBuildData.items.boots.map(id => getItemById(id));
        const sitPromises = (currentBuildData.items.situational || []).map(id => getItemById(id));

        const [core, boot, sit] = await Promise.all([
          Promise.all(corePromises),
          Promise.all(bootPromises),
          Promise.all(sitPromises)
        ]);

        setCoreItems(core.filter((i): i is Item => i !== null));
        setBoots(boot.filter((i): i is Item => i !== null));
        setSituationalItems(sit.filter((i): i is Item => i !== null));

        // Load Runes
        if (fetchedRunes.length > 0) {
            console.log("[ChampionBuild] Processing fetched runes:", fetchedRunes);
            try {
                const trees = new Set<number>();
                const resolvedRunes: Rune[] = [];
                
                for (const id of fetchedRunes) {
                    try {
                        const r = await getRuneById(id);
                        if (r) {
                            resolvedRunes.push(r);
                            const t = await getRuneTree(id);
                            if (t) {
                                trees.add(t.id);
                            } else {
                                console.warn(`[ChampionBuild] No tree found for rune ${id}`);
                            }
                        } else {
                             console.warn(`[ChampionBuild] Rune not found for ID ${id}`);
                        }
                    } catch (runeErr) {
                        console.error(`[ChampionBuild] Error processing rune ${id}:`, runeErr);
                    }
                }

                console.log("[ChampionBuild] Resolved Runes:", resolvedRunes);

                const treeGroups: Record<number, Rune[]> = {};
                for (const r of resolvedRunes) {
                    try {
                        const t = await getRuneTree(r.id);
                        if (t) {
                            if (!treeGroups[t.id]) treeGroups[t.id] = [];
                            treeGroups[t.id].push(r);
                        }
                    } catch (treeErr) {
                         console.error(`[ChampionBuild] Error grouping rune ${r.id} to tree:`, treeErr);
                    }
                }

                console.log("[ChampionBuild] Tree Groups:", treeGroups);

                const sortedTrees = Object.entries(treeGroups).sort((a, b) => b[1].length - a[1].length);
                if (sortedTrees.length > 0) {
                    const pTreeId = parseInt(sortedTrees[0][0]);
                    const sTreeId = sortedTrees.length > 1 ? parseInt(sortedTrees[1][0]) : 0;

                    const pTree = await getRuneTreeById(pTreeId);
                    const sTree = await getRuneTreeById(sTreeId);
                    
                    console.log(`[ChampionBuild] Resolved Trees - Primary: ${pTree?.name}, Secondary: ${sTree?.name}`);

                    setPrimaryTree(pTree);
                    setSecondaryTree(sTree);
                    setResolvedPrimaryRunes(treeGroups[pTreeId] || []);
                    setResolvedSecondaryRunes(treeGroups[sTreeId] || []);
                    
                     if (pTree) {
                        const keystones = pTree.slots[0].runes.map(r => r.id);
                        const foundKeystone = treeGroups[pTreeId].find(r => keystones.includes(r.id));
                        setKeystone(foundKeystone || null);
                        console.log(`[ChampionBuild] Resolved Keystone: ${foundKeystone?.name}`);
                    }
                }

                const shards = STAT_SHARDS.filter(s => fetchedShards.includes(s.id));
                setResolvedShards(shards);
                console.log("[ChampionBuild] Resolved Shards:", shards);

            } catch (processErr) {
                console.error("[ChampionBuild] Critical error in rune processing:", processErr);
            }
        } else {
            const [primary, secondary, ks] = await Promise.all([
              getRuneTreeById(currentBuildData.runes.primary.tree),
              getRuneTreeById(currentBuildData.runes.secondary.tree),
              getRuneById(currentBuildData.runes.primary.keystone)
            ]);

            setPrimaryTree(primary);
            setSecondaryTree(secondary);
            setKeystone(ks);

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
  }, [championName, selectedRole]);

  // Sync selectedRole when buildData changes (e.g. champion change from props)
  useEffect(() => {
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
          const proxyBase = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';
          const response = await fetch(`${proxyBase}/api/scrape-builds/${championName.toLowerCase()}/${selectedRole.toLowerCase()}`);
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

              // 2. Update Items (use structured items if available, fallback to flat itemIds)
              if (data.items && (data.items.core || data.items.boots || data.items.situational)) {
                 const corePromises = (data.items.core || []).map((id: number) => getItemById(id.toString()));
                 const bootPromises = (data.items.boots || []).map((id: number) => getItemById(id.toString()));
                 const sitPromises = (data.items.situational || []).map((id: number) => getItemById(id.toString()));
                 
                 const [core, boot, sit] = await Promise.all([
                   Promise.all(corePromises),
                   Promise.all(bootPromises),
                   Promise.all(sitPromises)
                 ]);
                 
                 setCoreItems(core.filter((i: Item | null): i is Item => i !== null));
                 setBoots(boot.filter((i: Item | null): i is Item => i !== null));
                 setSituationalItems(sit.filter((i: Item | null): i is Item => i !== null));
              } else if (data.itemIds && data.itemIds.length > 0) {
                 // Fallback: flat itemIds (legacy)
                 const itemPromises = data.itemIds.map((id: number) => getItemById(id.toString()));
                 const fetchedItems = await Promise.all(itemPromises);
                 const validItems = fetchedItems.filter((i: Item | null): i is Item => i !== null);
                 setCoreItems(validItems);
                 setBoots([]);
                 setSituationalItems([]);
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
    // Commented out loading spinner to simplify debugging
    console.log("Render: loading=", loading, "activeData=", !!activeData);
    // return (
    //   <div className="flex items-center justify-center p-8">
    //     <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
    //     {!activeData && !loading && <span className="ml-3 text-gray-400 text-xs">Cargando datos...</span>}
    //   </div>
    // );
  }

  return (
    <div className="space-y-6">
      {/* Header: Role Dropdown & Auto Import */}
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between gap-3">
          {/* Role Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors min-w-[140px]"
            >
              <img
                src={ROLE_ICONS[selectedRole.toLowerCase()] || ROLE_ICONS['mid']}
                className="w-5 h-5"
                alt={selectedRole}
              />
              <span className="text-sm text-white font-medium capitalize">{selectedRole}</span>
              <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                {Object.keys(ROLE_ICONS).map((roleKey) => (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => {
                      isUserRoleChange.current = true;
                      setSelectedRole(roleKey.charAt(0).toUpperCase() + roleKey.slice(1));
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                      selectedRole.toLowerCase() === roleKey
                        ? 'bg-hextech-gold/20 text-hextech-gold'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <img src={ROLE_ICONS[roleKey]} className="w-4 h-4" alt={roleKey} />
                    <span className="capitalize">{roleKey}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Winrate Badge */}
          {winrate && (
            <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
              {winrate}
            </span>
          )}

          {/* Auto-Import Button (always visible) */}
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs font-semibold rounded-lg border border-yellow-500/50 transition-colors ml-auto ${
              importLoading ? 'opacity-50 cursor-wait' : ''
            }`}
            onClick={handleAutoImport}
            disabled={importLoading}
          >
            {importLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {importLoading ? 'Importando...' : 'Importar Build'}
          </button>
        </div>

        {/* Build description */}
        <p className="text-xs text-gray-400 mt-2 italic line-clamp-1">
          {activeData?.description || 'Build recomendada'}
        </p>
      </div>
      
      {/* Empty State Placeholder */}
      {!loading && !activeData && coreItems.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-700 rounded-lg bg-gray-900/30">
          <div className="w-16 h-16 rounded-full bg-hextech-gold/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-hextech-gold" />
          </div>
          <h3 className="text-gray-300 font-semibold mb-2">Build no cargada</h3>
          <p className="text-gray-500 text-xs text-center max-w-[250px] mb-4">
            Presiona el botón <span className="text-yellow-400">Importar Build</span> para obtener los datos más recientes.
          </p>
          <button
            onClick={handleAutoImport}
            className="px-4 py-2 bg-hextech-gold/20 hover:bg-hextech-gold/30 text-hextech-gold text-xs font-bold uppercase tracking-wider rounded border border-hextech-gold/40 transition-all hover:scale-105"
          >
            Importar Ahora
          </button>
        </div>
      )}

      {/* Content (Only show if we have data) */}
      {(activeData || coreItems.length > 0) && (
        <>
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
      {boots.length > 0 && (
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
      )}

      {/* Situational Items */}
      {situationalItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Items Situacionales</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {situationalItems.map(item => (
              <div key={item.id} className="relative group" onMouseEnter={() => setActiveTooltip(`sit-${item.id}`)} onMouseLeave={() => setActiveTooltip(null)}>
                <div className="w-10 h-10 rounded-lg border border-purple-500/50 overflow-hidden bg-gray-800 hover:border-purple-400 transition-colors cursor-pointer">
                  <img src={getItemImageUrl(item.image.full)} alt={item.name} className="w-full h-full object-cover" />
                </div>
                {/* Tooltip */}
                {activeTooltip === `sit-${item.id}` && (
                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 p-3 bg-hextech-black rounded-lg shadow-2xl border border-purple-500/30 animate-in fade-in zoom-in-95 duration-200">
                    <span className="font-bold text-purple-300 text-xs uppercase tracking-widest block truncate">{item.name}</span>
                    <p className="text-[10px] text-gray-400 mt-1 italic">{item.plaintext || 'Objeto situacional.'}</p>
                    {item.gold && (
                      <div className="flex items-center justify-between pt-1 mt-1 border-t border-white/5 text-[10px]">
                        <span className="text-gray-500">Costo</span>
                        <span className="text-yellow-500 font-bold">{item.gold.total}G</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Runes - Vertical Layout */}
      {primaryTree && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Runas</h4>
          <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-700 space-y-3">

            {/* Primary Row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5" title={primaryTree.name}>
                <img src={getRuneIconUrl(primaryTree.icon)} className="w-5 h-5" alt={primaryTree.name} />
              </div>

              {/* Keystone */}
              {keystone && (
                <div
                  className="relative group w-10 h-10 rounded-full border-2 overflow-hidden bg-black/40 cursor-help flex-shrink-0"
                  style={{ borderColor: (primaryTree?.key && RUNE_TREE_COLORS[primaryTree.key]) ? RUNE_TREE_COLORS[primaryTree.key] + '80' : '#444' }}
                  title={keystone.name}
                >
                  <img src={getRuneIconUrl(keystone.icon)} className="w-full h-full" alt={keystone.name} />
                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-hextech-black rounded-lg shadow-xl border border-gray-600 text-center">
                    <span className="text-xs font-bold" style={{ color: (primaryTree?.key && RUNE_TREE_COLORS[primaryTree.key]) || '#eda63b' }}>{keystone.name}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{keystone.shortDesc ? keystone.shortDesc.replace(/<[^>]*>?/gm, '') : 'Runa clave poderosa.'}</p>
                  </div>
                </div>
              )}

              {/* Primary Runes (excluding keystone) */}
              {resolvedPrimaryRunes.filter(r => r.id !== keystone?.id).map(rune => (
                <div
                  key={rune.id}
                  className="relative group w-7 h-7 rounded-full bg-black/40 border border-gray-700 overflow-hidden cursor-help flex-shrink-0 hover:border-gray-500 transition-colors"
                  title={rune.name}
                >
                  <img src={getRuneIconUrl(rune.icon)} className="w-full h-full" alt={rune.name} />
                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-40 p-2 bg-hextech-black rounded-lg shadow-xl border border-gray-600 text-center">
                    <span className="text-[10px] font-bold text-white">{rune.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Row */}
            {secondaryTree && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5" title={secondaryTree.name}>
                  <img src={getRuneIconUrl(secondaryTree.icon)} className="w-5 h-5 opacity-80" alt={secondaryTree.name} />
                </div>

                {resolvedSecondaryRunes.map(rune => (
                  <div
                    key={rune.id}
                    className="relative group w-7 h-7 rounded-full bg-black/40 border border-gray-700 overflow-hidden cursor-help flex-shrink-0 hover:border-gray-500 transition-colors"
                    title={rune.name}
                  >
                    <img src={getRuneIconUrl(rune.icon)} className="w-full h-full" alt={rune.name} />
                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-40 p-2 bg-hextech-black rounded-lg shadow-xl border border-gray-600 text-center">
                      <span className="text-[10px] font-bold text-white">{rune.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stat Shards Row */}
            {resolvedShards.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide w-5 text-center" title="Stats">✦</span>
                {resolvedShards.map((shard, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded bg-black/20 border border-gray-700 flex items-center justify-center flex-shrink-0"
                  >
                    <img src={`https://ddragon.leagueoflegends.com/cdn/img/${shard.icon}`} className="w-4 h-4" alt="shard" />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Analysis Panel (Resume) */}
      {analysis && (
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
      </>
      )}
    </div>
  );
}

