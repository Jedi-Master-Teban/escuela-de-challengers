// NewsCarousel - SkillCapped-inspired carousel for news/featured content
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsSlide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: 'cyan' | 'gold' | 'purple' | 'red';
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface NewsCarouselProps {
  slides: NewsSlide[];
  autoPlay?: boolean;
  interval?: number;
}

const tagColors = {
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  gold: 'bg-hextech-gold/20 text-hextech-gold border-hextech-gold/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function NewsCarousel({ slides, autoPlay = true, interval = 5000 }: NewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;
    
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, nextSlide, slides.length]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="relative rounded-xl overflow-hidden border border-hextech-gold/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Slide */}
      <div className="relative aspect-[16/7] bg-gradient-to-br from-hextech-blue via-hextech-blue/80 to-cyan-900/50 overflow-hidden">
        {/* Background Image/Pattern */}
        {currentSlide.image ? (
          <img 
            src={currentSlide.image} 
            alt={currentSlide.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-hextech-gold/10 rounded-full blur-3xl" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-hextech-black/80 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative h-full flex items-center p-8 pl-16 lg:p-12 lg:pl-20">
          <div className="max-w-xl">
            {/* Tag */}
            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border mb-4 ${tagColors[currentSlide.tagColor]}`}>
              {currentSlide.tag}
            </span>
            
            {/* Title - Bold uppercase like SkillCapped */}
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-white mb-2 leading-tight">
              {currentSlide.title}
            </h2>
            
            {/* Subtitle */}
            <p className="text-lg text-gray-300 mb-6 max-w-md">
              {currentSlide.subtitle}
            </p>
            
            {/* CTA Button */}
            {currentSlide.ctaText && (
              <button className="px-6 py-3 bg-hextech-gold hover:bg-amber-500 text-hextech-black font-bold uppercase tracking-wide rounded transition-all hover:scale-105">
                {currentSlide.ctaText}
              </button>
            )}
          </div>
        </div>
        
        {/* "NEW" or Featured Side Tab */}
        <div className="absolute top-4 right-4 px-3 py-6 bg-hextech-gold text-hextech-black font-bold text-xs uppercase tracking-widest" 
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          Nuevo
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
              bg-red-500/80 hover:bg-red-400 rounded-full text-white transition-all hover:scale-110 shadow-lg z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
              bg-red-500/80 hover:bg-red-400 rounded-full text-white transition-all hover:scale-110 shadow-lg z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Footer with Role Filter + Dot Indicators */}
      <div className="flex items-center justify-between px-4 py-3 bg-hextech-black/90 border-t border-hextech-gold/20">
        {/* Left side - could be filters or info */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-hextech-gold font-medium">Academia Challengers</span>
          <span>|</span>
          <span>Season 16</span>
        </div>
        
        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  index === currentIndex 
                    ? 'bg-hextech-gold border-hextech-gold' 
                    : 'bg-transparent border-gray-500 hover:border-hextech-gold/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
