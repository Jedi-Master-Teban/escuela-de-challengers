// useParallax - Custom hook for parallax zoom scrolling effect
import { useState, useEffect, useCallback, type RefObject } from 'react';

interface ParallaxConfig {
  speed?: number; // Multiplier for parallax speed (0.5 = half speed)
  zoomFactor?: number; // How much to zoom (0.1 = 10% zoom at full scroll)
  maxScroll?: number; // Maximum scroll distance to consider
}

interface ParallaxValues {
  translateY: number;
  scale: number;
  opacity: number;
}

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  config: ParallaxConfig = {}
): ParallaxValues {
  const { speed = 0.5, zoomFactor = 0.15, maxScroll = 800 } = config;
  
  const [values, setValues] = useState<ParallaxValues>({
    translateY: 0,
    scale: 1,
    opacity: 1,
  });

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    const scrollY = window.scrollY;
    const elementTop = ref.current.offsetTop;
    const elementHeight = ref.current.offsetHeight;
    
    // Only apply effect when element is in or near viewport
    if (scrollY < elementTop + elementHeight) {
      const scrollProgress = Math.min(scrollY / maxScroll, 1);
      
      setValues({
        translateY: scrollY * speed,
        scale: 1 + (scrollProgress * zoomFactor),
        opacity: Math.max(1 - (scrollProgress * 0.3), 0.7),
      });
    }
  }, [ref, speed, zoomFactor, maxScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return values;
}

export default useParallax;
