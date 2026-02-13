import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import parallaxBg from '../assets/parallax_bg.png';
import { useParallax } from '../hooks/useParallax';

// Hextech Icons (SVG components)
const VideoIcon = () => (
  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QuizIcon = () => (
  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChampionIcon = () => (
  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const RankIcon = () => (
  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default function LandingPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const parallax = useParallax(heroRef, { speed: 0.4, zoomFactor: 0.2 });

  const features = [
    {
      icon: <VideoIcon />,
      title: 'Lecciones en Video',
      description: 'Análisis profundo de partidas de alto elo desglosadas por expertos.',
    },
    {
      icon: <QuizIcon />,
      title: 'Quizzes Interactivos',
      description: 'Pon a prueba tu conocimiento de macro juego y toma de decisiones.',
    },
    {
      icon: <ChampionIcon />,
      title: 'Maestría de Campeones',
      description: 'Guías mecánicas detalladas para dominar cada campeón.',
    },
    {
      icon: <RankIcon />,
      title: 'Progreso de Rango',
      description: 'Trackea tu ascenso en la clasificación con estadísticas en tiempo real.',
    },
  ];

  const testimonials = [
    {
      name: 'xPekeFan99',
      quote: 'Subí a Diamante en solo 2 semanas gracias a las guías de macro. La claridad de los conceptos es otro nivel.',
    },
    {
      name: 'RivenMain_23',
      quote: 'Increíble calidad de producción, se siente como tecnología Piltover real. Los mentores saben de lo que hablan.',
    },
    {
      name: 'JungleKing',
      quote: 'Nunca entendí el pathing de la jungla hasta que vi el módulo avanzado. Vale cada centavo.',
    },
  ];

  return (
    <div className="min-h-screen bg-hextech-black text-gray-100">
      {/* Fixed Parallax Background - Visible behind all sections */}
      <div 
        className="fixed inset-0 bg-cover bg-center will-change-transform z-0"
        style={{ 
          backgroundImage: `url(${parallaxBg})`,
          transform: `scale(${parallax.scale})`,
          opacity: parallax.opacity,
          transition: 'transform 0.1s ease-out',
        }}
      />
      {/* Fixed gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-hextech-black/50 via-transparent to-hextech-black/90 z-0 pointer-events-none" />
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-hextech-blue/90 backdrop-blur-sm border-b border-hextech-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Academia Challengers" className="w-10 h-10 object-contain rounded-full" />
              <span className="text-hextech-gold font-bold text-lg hidden sm:block">Academia para Challengers</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#cursos" className="text-gray-300 hover:text-hextech-gold transition-colors">Cursos</a>
              <a href="#mentores" className="text-gray-300 hover:text-hextech-gold transition-colors">Mentores</a>
              <a href="#comunidad" className="text-gray-300 hover:text-hextech-gold transition-colors">Comunidad</a>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 border-2 border-hextech-gold text-hextech-gold hover:bg-hextech-gold hover:text-hextech-black transition-all font-semibold rounded"
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-hextech-gold"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isNavOpen && (
          <div className="md:hidden bg-hextech-blue border-t border-hextech-gold/30 py-4">
            <div className="flex flex-col items-center gap-4">
              <a href="#cursos" className="text-gray-300 hover:text-hextech-gold">Cursos</a>
              <a href="#mentores" className="text-gray-300 hover:text-hextech-gold">Mentores</a>
              <a href="#comunidad" className="text-gray-300 hover:text-hextech-gold">Comunidad</a>
              <button className="px-4 py-2 border-2 border-hextech-gold text-hextech-gold">
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden z-10">
        {/* Hero specific overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-hextech-black/20 to-hextech-black/70" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(200,170,110,0.2),transparent_60%)]" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hextech-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Hextech Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-hextech-gold/50 bg-hextech-gold/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-hextech-gold text-sm font-medium">Tecnología Hextech Certificada</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-hextech-gold via-amber-400 to-hextech-gold">
              ACADEMIA PARA
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400">
              CHALLENGERS
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Domina la Grieta con las estrategias de los mejores jugadores del mundo. 
            Tu camino desde <span className="text-hextech-gold">Hierro</span> hasta <span className="text-cyan-400">Challenger</span> comienza aquí.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-gradient-to-r from-hextech-gold to-amber-600 text-hextech-black font-bold text-lg rounded overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-hextech-gold/25"
            >
              <span className="relative z-10">EMPIEZA AHORA</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-hextech-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-cyan-400/50 text-cyan-400 font-semibold text-lg rounded hover:bg-cyan-400/10 transition-all"
            >
              Ver Demo
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-hextech-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="cursos" className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-hextech-gold mb-4">
              Herramientas de Maestría
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tecnología Piltover de vanguardia aplicada a tu aprendizaje.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-lg bg-hextech-black/70 backdrop-blur-md border border-hextech-gold/20 hover:border-hextech-gold/50 transition-all hover:-translate-y-1"
              >
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-hextech-gold/50 rounded-tl" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-hextech-gold/50 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-hextech-gold/50 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-hextech-gold/50 rounded-br" />

                <div className="mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-hextech-gold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-hextech-gold mb-4 drop-shadow-lg">
              Historias de Ascenso
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative p-6 rounded-lg bg-hextech-black/70 backdrop-blur-md border border-hextech-gold/20"
              >
                <div className="absolute -top-3 left-6">
                  <span className="text-5xl text-hextech-gold/30">"</span>
                </div>
                <p className="text-gray-300 italic mb-4 pt-4">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                    <span className="text-hextech-black font-bold text-sm">{testimonial.name.charAt(0)}</span>
                  </div>
                  <span className="text-hextech-gold font-medium">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden z-10">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-hextech-gold to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-hextech-gold to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-hextech-gold">¿Listo para</span>
            <br />
            <span className="text-cyan-400">Ascender?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Únete a la comunidad de élite y comienza tu viaje hacia la cima del ranking.
          </p>
          <button className="group relative px-10 py-5 bg-gradient-to-r from-hextech-gold to-amber-600 text-hextech-black font-bold text-xl rounded overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-hextech-gold/30">
            <span className="relative z-10">Comienza Tu Viaje</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-hextech-gold opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-hextech-black border-t border-hextech-gold/10 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="AC" className="w-8 h-8 object-contain rounded-full opacity-50 grayscale hover:grayscale-0 transition-all" />
            <span className="text-gray-500 text-sm">© 2024 Academia para Challengers</span>
          </div>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Twitter/X"
              className="text-gray-500 hover:text-hextech-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Discord"
              className="text-gray-500 hover:text-hextech-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@dishakelol" 
              target="_blank" 
              rel="noopener noreferrer"
              title="YouTube"
              className="text-gray-500 hover:text-hextech-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-hextech-gold transition-colors">Términos</a>
            <a href="#" className="hover:text-hextech-gold transition-colors">Privacidad</a>
            <a href="#" className="hover:text-hextech-gold transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
