// HomePage - Authenticated user home with news carousel and featured artist
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NewsCarousel from '../components/home/NewsCarousel';
import featuredArt from '../assets/featured_art.png';

// Role icons
import topIcon from '../assets/icons/roles/Top_icon.png';
import jungleIcon from '../assets/icons/roles/Jungle_icon.png';
import midIcon from '../assets/icons/roles/Middle_icon.png';

// News slides data
const newsSlides = [
  {
    id: 1,
    title: 'Season 16',
    subtitle: 'Nuevos cambios en el mapa, items actualizados y el meta más emocionante hasta ahora.',
    tag: 'Parche',
    tagColor: 'cyan' as const,
    ctaText: 'Ver Cambios',
  },
  {
    id: 2,
    title: 'Mecánicas Avanzadas',
    subtitle: 'Nuevo módulo disponible: animation cancels, combos y técnicas de alto elo.',
    tag: 'Academia',
    tagColor: 'gold' as const,
    ctaText: 'Explorar',
  },
  {
    id: 3,
    title: 'Torneo Interno',
    subtitle: 'Inscripciones abiertas para el primer torneo de la Academia Challengers - Marzo 2026.',
    tag: 'Evento',
    tagColor: 'purple' as const,
    ctaText: 'Inscribirse',
  },
];

// Quick access modules with role icons
const quickModules = [
  { 
    path: '/modules', 
    icon: midIcon, 
    label: 'Continuar Aprendiendo', 
    desc: 'Retoma donde lo dejaste',
    accent: 'cyan'
  },
  { 
    path: '/lab', 
    icon: jungleIcon, 
    label: 'Laboratorio Hextech', 
    desc: 'Explora campeones y builds',
    accent: 'gold'
  },
  { 
    path: '/dashboard', 
    icon: topIcon, 
    label: 'Mi Progreso', 
    desc: 'Ve tus estadísticas',
    accent: 'purple'
  },
];

// Featured artist info
const featuredArtist = {
  name: 'Artista Invitado',
  social: {
    twitter: '@artista_lol',
    artstation: 'artstation.com/artista',
  },
};

export default function HomePage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Invocador';

  return (
    <div className="min-h-screen bg-hextech-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hextech-gold mb-2">
            ¡Bienvenido de vuelta, <span className="text-white">{displayName}</span>!
          </h1>
          <p className="text-gray-400">
            Tu camino hacia Challenger continúa...
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* News Section - 60% width */}
          <div className="lg:w-3/5 space-y-8">
            {/* Carousel Banner */}
            <NewsCarousel slides={newsSlides} />

            {/* Quick Access - Redesigned Cards */}
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-4">
                Acceso Rápido
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickModules.map((module) => (
                  <Link
                    key={module.path}
                    to={module.path}
                    className="group relative overflow-hidden rounded-xl border border-hextech-gold/20 
                      bg-gradient-to-br from-hextech-blue/30 to-hextech-black
                      hover:border-hextech-gold/50 transition-all duration-300"
                  >
                    {/* Background glow on hover */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity 
                      ${module.accent === 'cyan' ? 'bg-cyan-500' : 
                        module.accent === 'gold' ? 'bg-hextech-gold' : 'bg-purple-500'}`} 
                    />
                    
                    <div className="relative p-5">
                      {/* Icon */}
                      <div className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform">
                        <img 
                          src={module.icon} 
                          alt="" 
                          className="w-full h-full object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100"
                        />
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-hextech-gold font-bold uppercase tracking-wide text-sm mb-1">
                        {module.label}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-gray-500 text-sm">{module.desc}</p>
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className={`h-1 w-0 group-hover:w-full transition-all duration-300
                      ${module.accent === 'cyan' ? 'bg-cyan-500' : 
                        module.accent === 'gold' ? 'bg-hextech-gold' : 'bg-purple-500'}`} 
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Featured Artist - 40% width */}
          <div className="lg:w-2/5 space-y-6">
            <div className="rounded-xl overflow-hidden border border-hextech-gold/30 bg-hextech-blue/10">
              {/* Artwork */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={featuredArt}
                  alt="Featured artwork"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-hextech-black via-transparent to-transparent" />
                
                {/* Side tab */}
                <div className="absolute top-4 right-0 px-2 py-4 bg-hextech-gold text-hextech-black font-bold text-xs uppercase tracking-widest"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  Destacado
                </div>
              </div>
              
              {/* Artist Info */}
              <div className="p-4 bg-hextech-black/80">
                <h3 className="text-hextech-gold font-bold uppercase tracking-wide mb-3">
                  {featuredArtist.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={`https://twitter.com/${featuredArtist.social.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1DA1F2]/10 
                      text-[#1DA1F2] text-sm hover:bg-[#1DA1F2]/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    {featuredArtist.social.twitter}
                  </a>
                  <a 
                    href={`https://${featuredArtist.social.artstation}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13AFF0]/10 
                      text-[#13AFF0] text-sm hover:bg-[#13AFF0]/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24-2.56a2.425 2.425 0 0 0-.369-1.263L14.837 0H9.564L21.208 20.16l2.792-4.838v-.16zM8.32 8.32l5.44 9.44H2.88L8.32 8.32z"/>
                    </svg>
                    ArtStation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
