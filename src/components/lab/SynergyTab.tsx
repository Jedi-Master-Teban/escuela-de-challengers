import { useState, useEffect } from 'react';
import { calculateTeamBalance } from '../../utils/teamAnalysis';
import type { TeamAnalysisResult } from '../../utils/teamAnalysis';
import { AlertCircle, Sword, Zap, Shield, Waves, Info, Sparkles } from 'lucide-react';
import { ChampionSelector } from './ChampionSelector';

// Import Role Icons
import TopIcon from '../../assets/icons/roles/Top_icon.png';
import JungleIcon from '../../assets/icons/roles/Jungle_icon.png';
import MidIcon from '../../assets/icons/roles/Middle_icon.png';
import AdcIcon from '../../assets/icons/roles/Bottom_icon.png';
import SupportIcon from '../../assets/icons/roles/Support_icon.png';




export default function SynergyTab() {
  const [team, setTeam] = useState<string[]>(['', '', '', '', '']); // 5 champions
  const [analysis, setAnalysis] = useState<TeamAnalysisResult | null>(null);
  
  useEffect(() => {
    const fullTeam = team.filter((n: string) => n !== '');
    if (fullTeam.length > 0) {
      setAnalysis(calculateTeamBalance(fullTeam));
    } else {
      setAnalysis(null);
    }
  }, [team]);

  // Get synergy explanations based on current team
  const getSynergyTips = () => {
    const teamChamps = team.filter(n => n !== '').map(n => n.toLowerCase());
    const tips: string[] = [];
    
    if (teamChamps.includes('pyke') && teamChamps.includes('nami')) {
      tips.push("🐟 Pyke + Nami: 'Bubble into Pitchfork' - Nami Q permite que Pyke golpee su Q con daño extendido.");
    }
    if (teamChamps.includes('yasuo') || teamChamps.includes('yone')) {
      tips.push("🌊 Yasuo/Yone + Knockups: Tu ultimate se beneficia de cualquier crowd control enemigo.");
    }
    if (teamChamps.includes('leona') && (teamChamps.includes('jinx') || teamChamps.includes('caitlyn'))) {
      tips.push("⭐ Leona + Long Range ADC: Leona puede engage mientras tu ADC fulltrinea desde distancia.");
    }
    if (teamChamps.includes('thresh') && teamChamps.includes('draven')) {
      tips.push("🪓 Thresh + Draven: Thresh puede catchear enemigos en la E de Draven para combos.");
    }
    if (teamChamps.includes('malphite') || teamChamps.includes('amumu')) {
      tips.push("💥 Malphite/Amumu + AOE: Tu engage masivo permite que damage dealers maximicen output.");
    }
    if (teamChamps.includes('lulu') && (teamChamps.includes('jinx') || teamChamps.includes('tristana') || teamChamps.includes('kaisa'))) {
      tips.push("🧚 Lulu + Hypercarries: Protege a tu hypercarry mientras escala y hace cleanup.");
    }
    if (teamChamps.includes('renata') && (teamChamps.includes('jinx') || teamChamps.includes('caitlyn'))) {
      tips.push("💉 Renata + Long Range: Renata W acelera a tu ADC para trades y escapes.");
    }
    if (teamChamps.includes(' Sett') && teamChamps.includes('jinx')) {
      tips.push("👊 Sett + Jinx: Sett puede catchear con E para que Jinx aplique pasivo.");
    }
    if (teamChamps.filter(c => ['mage', 'assassin'].some(r => c.includes(r))).length >= 2) {
      tips.push("🎯 Composition Burst: Alto burst permite eliminar objetivos antes de que Gegner reaccione.");
    }
    if (teamChamps.filter(c => ['tank', 'fighter'].some(r => c.includes(r))).length >= 2) {
      tips.push("🛡️ Double Frontline: Tu equipo puede splitpushear mientras el otro miembro divide.");
    }
    
    return tips;
  };

  const synergyTips = getSynergyTips();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Explanation Header */}
      <div className="bg-hextech-blue/10 border border-hextech-gold/20 p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-32 h-32 text-hextech-gold" />
        </div>
        <h2 className="text-xl font-bold text-hextech-gold mb-2 flex items-center gap-2">
           <Zap className="w-6 h-6" /> Strategic Synergy Lab
        </h2>
        <p className="text-gray-400 text-sm max-w-2xl">
          Simula composiciones completas para identificar debilidades estructurales. 
          Nuestros algoritmos analizan el balance de daño, la capacidad de control (CC), 
          la durabilidad de la línea frontal y el potencial de iniciación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Teammate Selection */}
        <div className="lg:col-span-1 lg:border-r lg:border-gray-800 lg:pr-8 mb-8 lg:mb-0">
          <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500 mb-4">Composición del Equipo</h3>
          <div className="space-y-4">
             {/* Team Configuration */}
             <div className="grid grid-cols-1 gap-3 mb-8">
                {team.map((champ, idx) => (
                   <div key={idx} className="bg-gray-900/40 p-3 rounded-lg border border-white/5">
                     <div className="flex items-center gap-2 mb-1">
                        <img 
                          src={[TopIcon, JungleIcon, MidIcon, AdcIcon, SupportIcon][idx]} 
                          alt={['Top', 'Jungle', 'Mid', 'ADC', 'Support'][idx]} 
                          className="w-4 h-4 opacity-70"
                        />
                        <label className="text-xs text-gray-500 block uppercase tracking-wide font-semibold">
                            {['Top', 'Jungle', 'Mid', 'ADC', 'Support'][idx]}
                        </label>
                     </div>
                     <ChampionSelector
                       selectedChampion={champ}
                       onSelect={(newChamp) => {
                           const newTeam = [...team];
                           newTeam[idx] = newChamp;
                           setTeam(newTeam);
                       }}
                       placeholder={`Seleccionar ${['Top', 'Jungle', 'Mid', 'ADC', 'Support'][idx]}`}
                       roleFilter={['Top', 'Jungle', 'Mid', 'Bot', 'Support'][idx]} 
                     />
                   </div>
                ))}
             </div>     
            
            {team.every(n => n === '') && (
              <p className="text-xs text-yellow-500/60 italic pt-4">
                * Selecciona al menos un campeón para comenzar el análisis.
              </p>
            )}
            
            <button 
                onClick={() => setTeam(['', '', '', '', ''])}
                className="w-full mt-4 py-2 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-colors uppercase tracking-widest font-bold"
            >
                Limpiar Equipo
            </button>
          </div>
        </div>

        {/* Right: Analysis Dashboard */}
        <div className="lg:col-span-2 space-y-8">
           {analysis ? (
             <>
               {/* Metrics Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Control (CC)', value: analysis.score.cc, max: 10, icon: Sparkles, color: 'text-purple-400', barCol: 'bg-purple-500' },
                    { label: 'Frontline', value: analysis.score.durability, max: 8, icon: Shield, color: 'text-green-400', barCol: 'bg-green-500' },
                    { label: 'Waveclear', value: analysis.score.waveclear, max: 10, icon: Waves, color: 'text-cyan-400', barCol: 'bg-cyan-500' },
                    { label: 'Iniciación', value: analysis.score.engage, max: 8, icon: Sword, color: 'text-orange-400', barCol: 'bg-orange-500' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{stat.label}</span>
                        </div>
                        <span className={`text-sm font-mono font-bold ${stat.color}`}>
                          {Math.round((stat.value / stat.max) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full opacity-80 shadow-[0_0_10px_currentColor] transition-all duration-1000 ${stat.barCol}`}
                          style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
               </div>

               {/* Damage Distribution Overlay */}
               <div className="bg-gray-900/40 p-6 rounded-xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-end">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Distribución de Daño</h4>
                    <div className="flex gap-4 text-[10px] font-bold">
                        <span className="text-blue-400">AP: {Math.round(analysis.damageProfile.AP * 20)}%</span>
                        <span className="text-red-400">AD: {Math.round(analysis.damageProfile.AD * 20)}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-700" 
                      style={{ width: `${(analysis.damageProfile.AP / (analysis.damageProfile.AP + analysis.damageProfile.AD || 1)) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-700" 
                      style={{ width: `${(analysis.damageProfile.AD / (analysis.damageProfile.AP + analysis.damageProfile.AD || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    * El cálculo incluye campeones de daño mixto y tanques de utilidad.
                  </p>
               </div>

               {/* Synergy Explanations */}
               {synergyTips.length > 0 && (
                 <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                   <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-hextech-gold">Sinergias Detectadas</h4>
                   {synergyTips.map((tip, i) => (
                     <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-hextech-gold/5 p-2 rounded border border-hextech-gold/10">
                       <span className="text-hextech-gold shrink-0">{tip.split(':')[0]}</span>
                       <span>{tip.substring(tip.indexOf(':') + 1)}</span>
                     </div>
                   ))}
                 </div>
               )}

               {/* Warnings & Insights */}
               <div className="space-y-3">
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-red-400 bg-red-400/5 px-4 py-3 rounded-lg border border-red-400/20 animate-in slide-in-from-left">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="font-medium">{w}</span>
                    </div>
                  ))}
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-yellow-400 bg-yellow-400/5 px-4 py-3 rounded-lg border border-yellow-400/20 animate-in slide-in-from-left">
                      <Sparkles className="w-5 h-5 shrink-0" />
                      <span className="font-medium">{s}</span>
                    </div>
                  ))}
                  {analysis.warnings.length === 0 && analysis.suggestions.length === 0 && team.filter(n => n !== '').length >= 3 && (
                    <div className="flex items-center gap-3 text-sm text-green-400 bg-green-400/5 px-4 py-3 rounded-lg border border-green-400/20">
                      <Sparkles className="w-5 h-5 shrink-0" />
                      <span className="font-medium">Composición balanceada y sólida. ¡Excelente trabajo estratégico!</span>
                    </div>
                  )}
               </div>
             </>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                <Info className="w-12 h-12 text-gray-600 mb-4" />
                <h4 className="text-gray-400 font-bold uppercase tracking-widest mb-2">Panel de Análisis</h4>
                <p className="text-xs text-gray-500 max-w-xs">
                  Selecciona campeones en el panel de la izquierda para ver las métricas de tu equipo.
                </p>
             </div>
           )}
        </div>
      </div>

      {/* Logic Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-gray-800">
        {[
          { title: "Damage Ratio", desc: "Alerta si >80% es de un solo tipo de daño." },
          { title: "Frontline Score", desc: "Mide resistencia física y peso en la pelea." },
          { title: "CC Capacity", desc: "Suma de stuns, roots y desplazamientos." },
          { title: "Waveclear", desc: "Habilidad para defender bajo torre y pushear." }
        ].map(item => (
            <div key={item.title} className="p-4 bg-black/20 rounded-lg border border-white/5">
                <h5 className="text-[10px] font-bold text-hextech-gold uppercase mb-1">{item.title}</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
        ))}
      </div>
    </div>
  );
}
