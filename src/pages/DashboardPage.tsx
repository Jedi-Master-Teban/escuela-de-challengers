import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HextechButton } from '../components/hextech';
import { useRiotApi } from '../hooks/useRiotApi';
import { Search, AlertCircle } from 'lucide-react';

// Components
import RankOverviewCard from '../components/dashboard/RankOverviewCard';
import StatsSummary from '../components/dashboard/StatsSummary';
import MatchHistoryWidget from '../components/dashboard/MatchHistoryWidget';
import CourseHeroCard from '../components/dashboard/CourseHeroCard';



// Mock Data
import { 
  MOCK_RANK_DATA, 
  MOCK_MATCH_HISTORY, 
  MOCK_STATS_SUMMARY,
  MOCK_COURSES 
} from '../data/mock/dashboardData';

// Firebase Progress
import { getAllCompletedLessons } from '../services/firebase/progressService';

// Registry for module/lesson mapping
import registry from '../data/registry.json';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    fetchSummonerData, 
    account, 
    summoner, 
    matches,
    getSoloQueueRank, 
    loading, 
    error,
    disconnect
  } = useRiotApi();

  const [riotIdInput, setRiotIdInput] = useState('');

  // Course progress from Firebase
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});

  // Map registry module IDs to MOCK_COURSES IDs
  const MODULE_ID_MAP: Record<string, string> = {
    'fundamentos': 'fundamentals',
    'macro': 'macro',
    'mecanicas': 'mechanics',
    'mentalidad': 'mental',
  };

  useEffect(() => {
    async function loadProgress() {
      if (!user) return;
      try {
        const completedLessons = await getAllCompletedLessons(user.uid);
        const completedIds = completedLessons.map(l => l.lessonId);

        // Count completions per module by checking lesson paths from registry
        const progress: Record<string, number> = {};
        for (const mod of registry.modules) {
          const courseId = MODULE_ID_MAP[mod.id] || mod.id;
          let count = 0;
          for (const lesson of mod.lessons) {
            // Build the lessonId the same way ModulesPage/LessonPage does
            const pathParts = lesson.path.replace('.json', '').split('/');
            const folder = pathParts[0];
            const lessonSlug = pathParts[pathParts.length - 1];
            const lessonId = `${folder}/${lessonSlug}`;
            if (completedIds.includes(lessonId)) {
              count++;
            }
          }
          progress[courseId] = count;
        }
        setCourseProgress(progress);
      } catch (err) {
        console.error('Failed to load course progress:', err);
      }
    }
    loadProgress();
  }, [user]);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const [gameName, tagLine] = riotIdInput.split('#').map(part => part.trim());
    if (gameName && tagLine) {
      await fetchSummonerData(gameName, tagLine);
    }
  };

  // Determine Data Source (Real vs Mock)
  const isLinked = !!account;
  const soloRank = getSoloQueueRank();

  // Map Real Data to Props
  const rankData = isLinked 
    ? (soloRank ? {
        tier: soloRank.tier, 
        rank: soloRank.rank, 
        lp: soloRank.leaguePoints,
        wins: soloRank.wins,
        losses: soloRank.losses,
        winrate: Math.round((soloRank.wins / (soloRank.wins + soloRank.losses)) * 100),
        lpHistory: [] 
      } : {
        tier: 'UNRANKED',
        rank: '',
        lp: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        lpHistory: []
      })
    : MOCK_RANK_DATA;

  // Real Stats or Mock
  const calculatedStats = (soloRank as any)?.stats;
  const statsData = isLinked && calculatedStats ? {
      kda: calculatedStats.kda,
      winrate: `${calculatedStats.winrate}%`,
      csPerMin: calculatedStats.csPerMin,
      visionPerMin: calculatedStats.visionPerMin,
      damagePerMin: calculatedStats.damagePerMin.toString(),
      // Dynamic Subtitles
      winrateSub: `${soloRank?.wins}W - ${soloRank?.losses}L`,
      csSub: 'Promedio',
      visionSub: 'Por Minuto',
      damageSub: 'Por Minuto'
  } : MOCK_STATS_SUMMARY;

  const displayMatches = isLinked && matches.length > 0 ? matches : (isLinked ? [] : MOCK_MATCH_HISTORY);

  return (
    <div className="min-h-screen bg-hextech-black pb-12 pt-20">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Welcome Section & Account Link */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex items-center gap-4">
             {/* Profile Icon (Real) */}
             {isLinked && summoner?.profileIconId && (
               <img 
                 src={`https://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${summoner.profileIconId}.png`} 
                 alt="Profile" 
                 className="w-16 h-16 rounded-full border-2 border-hextech-gold shadow-[0_0_15px_rgba(200,155,60,0.3)]"
               />
             )}
             
             <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  ¡Hola, {isLinked ? account?.gameName : (user?.displayName || 'Invocador')}!
                  {isLinked && summoner?.summonerLevel && (
                    <>
                      <span className="text-sm bg-hextech-metal/50 px-2 py-0.5 rounded border border-hextech-gold/30 text-hextech-gold font-mono">
                        Lvl {summoner.summonerLevel}
                      </span>
                      <button 
                        onClick={() => {
                          disconnect();
                          setRiotIdInput('');
                        }}
                        className="ml-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                      >
                        Desvincular
                      </button>
                    </>
                  )}
                </h1>
                <p className="text-gray-400">
                  {isLinked 
                    ? `Conectado como ${account?.gameName} #${account?.tagLine}` 
                    : 'Conecta tu cuenta de Riot para ver estadísticas reales.'}
                </p>
             </div>
          </div>

          {!isLinked && (
            <form onSubmit={handleLinkAccount} className="flex gap-2 w-full md:w-auto">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ej: Faker #KR1"
                  value={riotIdInput}
                  onChange={(e) => setRiotIdInput(e.target.value)}
                  className="bg-hextech-black/50 border-2 border-hextech-gold/30 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:border-hextech-gold focus:outline-none transition-colors w-full md:w-64"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-hextech-gold transition-colors" />
              </div>
              <HextechButton 
                variant="primary" 
                size="sm" 
                type="submit" 
                disabled={loading}
                isLoading={loading}
              >
                {loading ? 'Buscando...' : 'Vincular'}
              </HextechButton>
            </form>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Top Grid - Stats & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Rank, LP (Merged) */}
          <div className="lg:col-span-4 space-y-6">
            <RankOverviewCard 
              {...rankData as any} 
            />
          </div>

          {/* Right Column: Stats, Courses, History */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Row */}
            <StatsSummary {...statsData} />
            
            {/* Courses Section (Moved to Main Col) */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-hextech-gold mb-1">Ruta de Aprendizaje</h2>
                  <p className="text-gray-400 text-xs">Recomendado para ti</p>
                </div>
                <HextechButton variant="ghost" size="sm" onClick={() => navigate('/modules')} className="text-xs">
                  Ver Todo
                </HextechButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_COURSES.slice(0, 4).map((course) => {
                  // Get real lesson count from registry
                  const registryModule = registry.modules.find(
                    m => MODULE_ID_MAP[m.id] === course.id || m.id === course.id
                  );
                  const realLessonsCount = registryModule ? registryModule.lessons.length : course.lessonsCount;
                  const realCompleted = courseProgress[course.id] ?? 0;

                  return (
                    <CourseHeroCard 
                      key={course.id}
                      {...course}
                      lessonsCount={realLessonsCount}
                      completedCount={realCompleted}
                      onClick={() => navigate('/modules')}
                    />
                  );
                })}
              </div>
            </div>

            {/* Match History */}
            <MatchHistoryWidget matches={displayMatches as any} />
          </div>
        </div>


      </main>
    </div>
  );
}
