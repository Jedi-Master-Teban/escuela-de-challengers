// LabPage - Hextech Lab for exploring champion data, items, runes, and builds
import { useState } from 'react';
import { Package, Sparkles, Sword, Shield, Wrench } from 'lucide-react';
import type { ChampionSummary } from '../types/dataDragon';
import { ChampionGrid, ChampionDetailPanel, ChampionBuild, SynergyTab, ItemBrowser, RuneBrowser } from '../components/lab';
import RuneBuilder from '../components/lab/RuneBuilder';
import championBuilds from '../data/championBuilds.json';

type MainTab = 'champions' | 'items' | 'runes' | 'synergy';
type DetailTab = 'stats' | 'build';
type RuneTab = 'browse' | 'builder';

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

export default function LabPage() {
  const [selectedChampion, setSelectedChampion] = useState<ChampionSummary | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>('champions');
  const [detailTab, setDetailTab] = useState<DetailTab>('stats');
  const [runeTab, setRuneTab] = useState<RuneTab>('browse');



  const mainTabs = [
    { id: 'champions' as const, label: 'Campeones', icon: Sword },
    { id: 'items' as const, label: 'Items', icon: Package },
    { id: 'runes' as const, label: 'Runas', icon: Sparkles },
    { id: 'synergy' as const, label: 'Synergy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-hextech-black pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-hextech-gold mb-2">
            🔬 Laboratorio Hextech
          </h1>
          <p className="text-gray-400">
            Explora campeones, items, runas y builds del juego
          </p>
        </div>

        {/* Main Tabs - Centered */}
        <div className="flex justify-center gap-2 mb-6">
          {mainTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mainTab === tab.id
                  ? 'bg-hextech-gold text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {mainTab === 'items' ? (
          <div className="bg-hextech-blue/10 border border-hextech-gold/20 rounded-xl p-6">
            <ItemBrowser />
          </div>
        ) : mainTab === 'runes' ? (
          <div className="space-y-4">
            {/* Rune Sub-Tabs */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setRuneTab('browse')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  runeTab === 'browse'
                    ? 'bg-hextech-blue text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Explorar Runas
              </button>
              <button
                onClick={() => setRuneTab('builder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  runeTab === 'builder'
                    ? 'bg-hextech-gold text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Constructor de Runas
              </button>
            </div>
            
            <div className="bg-hextech-blue/10 border border-hextech-gold/20 rounded-xl p-6">
              {runeTab === 'browse' ? <RuneBrowser /> : <RuneBuilder />}
            </div>
          </div>
        ) : mainTab === 'synergy' ? (
          <div className="bg-hextech-blue/10 border border-hextech-gold/20 rounded-xl p-6">
            <SynergyTab />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Champion Grid - Left/Top */}
            <div className="lg:w-2/3">
              <ChampionGrid 
                onSelect={(champ) => {
                  setSelectedChampion(champ);
                  setDetailTab('stats');
                }}
                selectedId={selectedChampion?.id}
              />
            </div>

            {/* Champion Detail - Right/Bottom */}
            <div className="lg:w-1/3">
              {selectedChampion ? (
                <div className="sticky top-24 space-y-4">
                  {/* Detail Tabs */}
                    <div className="flex gap-2">
                     <button
                       onClick={() => setDetailTab('stats')}
                       className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                         detailTab === 'stats'
                           ? 'bg-hextech-blue text-white'
                           : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                       }`}
                     >
                       Estadísticas
                     </button>
                     <button
                       onClick={() => setDetailTab('build')}
                       className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                         detailTab === 'build'
                           ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                           : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                       }`}
                     >
                       Build
                     </button>
                   </div>

                   {/* Content */}
                   <div className="bg-hextech-blue/10 border border-hextech-gold/20 rounded-xl overflow-hidden max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hextech">
                     {detailTab === 'stats' ? (
                       <ChampionDetailPanel champion={selectedChampion} />
                     ) : (
                       <div className="p-6">
                         <ChampionBuild
                           championName={selectedChampion.id}
                           buildData={(championBuilds as Record<string, BuildData>)[selectedChampion.name]}
                         />
                       </div>
                     )}
                   </div>
                </div>
              ) : (
                <div className="bg-hextech-blue/10 border border-hextech-gold/20 rounded-xl p-8 text-center">
                  <div className="text-5xl mb-4">⚔️</div>
                  <h3 className="text-xl text-hextech-gold font-semibold mb-2">
                    Selecciona un Campeón
                  </h3>
                  <p className="text-gray-400">
                    Haz clic en cualquier campeón para ver sus estadísticas y build recomendado
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
